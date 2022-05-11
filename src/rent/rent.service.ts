import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import _, { before } from 'lodash';
import {
  InternalKickboard,
  InternalKickboardMode,
  InternalKickboardStatus,
} from '@hikick/openapi-internal-sdk';
import superagent from 'superagent';
import { FindConditions, FindManyOptions, In, Not, Repository } from 'typeorm';
import { AddonService } from '../addon/addon.service';
import { PhoneService } from '../auth/phone/phone.service';
import { TokenService } from '../auth/token/token.service';
import { Opcode } from '../common/opcode';
import { generateWhere, WhereType } from '../common/tools/generate-where';
import { InternalClient } from '../common/tools/internalClient';
import { reportMonitoringMetrics } from '../common/tools/monitoring';
import { Payment, PaymentItem } from '../payment/entities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { PricingService } from '../pricing/pricing.service';
import { ProviderService } from '../provider/provider.service';
import { User } from '../user/entities/user.entity';
import { ActivateRentDto } from './dto/activate-rent.dto';
import { EstimateRentDto } from './dto/estimate-rent.dto';
import { GetRentsDto } from './dto/get-rents.dto';
import { RenewalRentDto } from './dto/renewal-rent.dto';
import { RequestRentDto } from './dto/request-rent.dto';
import { UpdateRentDto } from './dto/update-rent.dto';
import { Rent, RentStatus } from './entities/rent.entity';

@Injectable()
export class RentService {
  private readonly logger = new Logger(RentService.name);

  constructor(
    @InjectRepository(Rent)
    private readonly rentRepository: Repository<Rent>,
    private readonly pricingService: PricingService,
    private readonly addonService: AddonService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    private readonly phoneService: PhoneService,
    private readonly tokenService: TokenService,
    private readonly providerService: ProviderService,
  ) {}

  public readonly platformId = _.get(process.env, 'HIKICK_PLATFORM_ID');
  public readonly paymentFailedMessage = '자동 결제를 실패하였습니다.';
  public readonly detachStatus = [RentStatus.Cancelled, RentStatus.Terminated];
  public readonly messageStatus = [RentStatus.Cancelled, RentStatus.Suspended];

  async requestAndPay(user: User, payload: RequestRentDto): Promise<Rent> {
    let payment: Payment | undefined;
    const rent = await this.request(user, _.omit(payload, 'cardId'));

    try {
      const { rentId } = rent;
      const month = dayjs().month() + 1;
      const name = `${month}월달 이용료(첫 이용❤️)`;
      const items = this.paymentService.generateItems(rent, true);
      payment = await this.paymentService.purchaseWithItems(user, {
        name,
        items,
        rentId,
      });
    } catch (err) {
      await this.remove(rent);
      this.logger.warn(
        `${user.name}(${user.userId}) has failed to pay and the rent is cancelled.`,
      );

      throw err;
    }

    const { card } = payment;
    const link = await this.tokenService.generateUrl(
      user,
      `/rents/${rent.rentId}`,
    );

    await this.phoneService.send(user.phoneNo, 'mykick_requested', {
      link,
      rent,
      card,
    });

    await reportMonitoringMetrics('mykickRequest', { rent, card });
    return rent;
  }

  async extend(beforeRent: Rent, isRenewal = false): Promise<Rent> {
    const { rentId, user } = beforeRent;
    const remainingMonths = beforeRent.remainingMonths - 1;
    const expiredAt = dayjs(beforeRent.expiredAt).add(30, 'days').toDate();
    const rent = this.rentRepository.merge(beforeRent, {
      expiredAt,
      remainingMonths,
    });

    const month = dayjs(rent.expiredAt).month() + 1;
    const name = `${month}월달 이용${isRenewal ? '(계약 연장)' : ''}`;
    const items = this.paymentService.generateItems(rent, isRenewal);
    const payment = await this.paymentService.purchaseWithItems(user, {
      name,
      items,
      rentId,
    });

    _.set(payment, 'amount', `${payment.amount.toLocaleString()}원`);
    const nextPaymentDate = dayjs(rent.expiredAt).format('M월 DD일');
    await this.phoneService.send(user.phoneNo, 'mykick_extend', {
      rent,
      payment,
      nextPaymentDate,
    });

    await reportMonitoringMetrics('mykickExtend', {
      rent,
      payment,
      nextPaymentDate,
    });

    this.logger.log(
      `${rent.name}(${rent.rentId}) has been successfully extended. (${dayjs(
        expiredAt,
      ).format('YYYY/MM/DD')})`,
    );

    if (
      rent.status === RentStatus.Suspended &&
      rent.message === this.paymentFailedMessage
    ) {
      rent.status = RentStatus.Activated;
      rent.message = null;
    }

    return rent.save();
  }

  async renewal(beforeRent: Rent, payload: RenewalRentDto): Promise<Rent> {
    const { pricingId, addonIds } = payload;
    const isLastMonthOfContract = beforeRent.remainingMonths < 0;
    const isUnderOneMonthLeft = dayjs(beforeRent.expiredAt)
      .subtract(30, 'days')
      .isBefore(dayjs());
    if (isLastMonthOfContract || !isUnderOneMonthLeft) {
      throw Opcode.RentHasRemainingMonthsYet();
    }

    const [pricing, addons] = await Promise.all([
      this.pricingService.findOneOrThrow(pricingId),
      this.addonService.getManyByIds(addonIds),
    ]);

    const remainingMonths = beforeRent.remainingMonths + pricing.periodMonths;
    const rent = this.rentRepository.merge(beforeRent, {
      pricing,
      remainingMonths,
    });

    rent.addons = addons;
    this.logger.log(
      `${rent.name}(${rent.rentId}) contract is trying to extend. (${remainingMonths})`,
    );

    return this.extend(rent, true);
  }

  async control(rent: Rent, enabled: boolean): Promise<Rent> {
    if (rent.status === RentStatus.Cancelled) throw Opcode.RentHasSuspended();
    const kickboard = await this.getKickboard(rent.kickboardCode);
    if (enabled) {
      await kickboard.start();
      this.logger.log(`${rent.name}(${rent.rentId}) has started ride.`);
      if (this.isHaveInsurance(rent)) {
        await this.startInsurance(rent, kickboard);
      }
    } else {
      await kickboard.stop();
      await this.stopInsurance(rent);
      this.logger.log(`${rent.name}(${rent.rentId}) has terminated ride.`);
    }

    return this.update(rent, { enabled });
  }

  async getStatus(
    rent: Rent,
  ): Promise<Pick<InternalKickboardStatus, 'gps' | 'createdAt' | 'power'>> {
    return this.getKickboard(rent.kickboardCode)
      .then((k) => k.getLatestStatus())
      .then((status) => _.pick(status, 'gps', 'createdAt', 'power'));
  }

  async alarm(rent: Rent): Promise<Rent> {
    if (rent.status === RentStatus.Cancelled) throw Opcode.RentHasSuspended();
    const kickboard = await this.getKickboard(rent.kickboardCode);
    if (!rent.enabled) await kickboard.start();
    await kickboard.alarmOn({ seconds: 5000 });
    if (!rent.enabled) await kickboard.stop();
    return rent;
  }

  async isHaveInsurance(rent: Rent): Promise<boolean> {
    const isMySafe = (addon) => addon.name.includes('마이세이프');
    return !!rent.addons.find(isMySafe);
  }

  async startInsurance(
    rent: Rent,
    kickboard: InternalKickboard,
  ): Promise<Rent> {
    if (rent.insuranceId) return rent;
    const provider = 'mertizfire';
    const { platformId } = this;
    const { kickboardCode, user } = rent;
    const { userId, phoneNo } = user;
    const { latitude, longitude } = await kickboard
      .getLatestStatus()
      .then((k) => k.gps);
    const insuranceClient = InternalClient.getInsurance();
    const phone = `+82${phoneNo.replace(/-/g, '').substring(1)}`;
    const { insuranceId } = await insuranceClient.start({
      provider,
      userId,
      platformId,
      kickboardCode,
      phone,
      latitude,
      longitude,
    });

    this.logger.log(
      `Insurance - ${rent.name}(${rent.rentId}) has request insurance (${insuranceId}).`,
    );

    return this.rentRepository.merge(rent, { insuranceId }).save();
  }

  async stopInsurance(rent: Rent): Promise<Rent> {
    if (!rent.insuranceId) return rent;
    await InternalClient.getInsurance()
      .getInsurance(rent.insuranceId)
      .then((insurance) => insurance.end);

    this.logger.log(
      `Insurance - ${rent.name}(${rent.rentId}) has ended requested insurance (${rent.insuranceId}).`,
    );

    return this.rentRepository.merge(rent, { insuranceId: null }).save();
  }

  async light(rent: Rent, lightOn: boolean): Promise<Rent> {
    if (rent.status === RentStatus.Cancelled) throw Opcode.RentHasSuspended();
    const kickboard = await this.getKickboard(rent.kickboardCode);
    lightOn ? await kickboard.lightOn({}) : await kickboard.lightOff();
    return this.update(rent, { lightOn });
  }

  async getPayments(rent: Rent, take = 9999): Promise<Payment[]> {
    const rentIds = [rent.rentId];
    const { payments } = await this.paymentService.getMany({ rentIds, take });
    return payments;
  }

  async getEstimateView(
    payload: EstimateRentDto,
  ): Promise<{ items: PaymentItem[]; total: number }> {
    const rent = await this.getEstimate(payload);
    const items = this.paymentService.generateItems(rent, true);
    const total = this.paymentService.calculateAmount(items);
    return { items, total };
  }

  async getEstimate(payload: EstimateRentDto): Promise<Rent> {
    const { pricingId, addonIds } = payload;
    const [pricing, addons] = await Promise.all([
      this.pricingService.findOneOrThrow(pricingId),
      this.addonService.getManyByIds(addonIds),
    ]);

    const remainingMonths = pricing.periodMonths;
    return this.rentRepository.create({ pricing, addons, remainingMonths });
  }

  async request(user: User, payload: RequestRentDto): Promise<Rent> {
    const { providerCode, name } = payload;
    const provider = await this.providerService.findOneByCode(providerCode);
    const rent = await this.getEstimate(
      _.omit(payload, 'name', 'providerCode'),
    );

    this.logger.log(`${user.name}(${user.userId}) has been requested new rent`);
    return this.rentRepository.merge(rent, { user, name, provider }).save();
  }

  async getKickboard(
    kickboardCode: string,
    bypassModeValidate = false,
  ): Promise<InternalKickboard> {
    try {
      const client = InternalClient.getKickboard();
      const kickboard = await client.getKickboard(kickboardCode);
      const validateMode = kickboard.mode !== InternalKickboardMode.MYKICK;
      if (!bypassModeValidate && validateMode) throw Error();
      return kickboard;
    } catch (err) {
      throw Opcode.NoKickboardInRent();
    }
  }

  async remove(rent: Rent) {
    await rent.remove();
  }

  async getManyByUser(
    user: User,
    payload: GetRentsDto,
  ): Promise<{ rents: Rent[]; total: number }> {
    return this.getMany({ userIds: [user.userId], ...payload });
  }

  async get(rentId: string): Promise<Rent | null> {
    return this.rentRepository.findOne({ rentId });
  }

  async getOrThrow(rentId: string): Promise<Rent> {
    const rent = await this.get(rentId);
    if (!rent) throw Opcode.CannotFindRent();
    return rent;
  }

  async getMany(
    payload: GetRentsDto,
  ): Promise<{ rents: Rent[]; total: number }> {
    const where: FindConditions<Rent> = {};
    const find: FindManyOptions<Rent> = {
      order: { createdAt: 'DESC' },
      relations: ['user'],
    };

    const searchTarget = {
      rentId: WhereType.Equals,
      name: WhereType.Contains,
      kickboardCode: WhereType.KickboardCode,
      'user.userId': WhereType.Contains,
      'user.name': WhereType.Contains,
      'user.phoneNo': WhereType.PhoneNumber,
    };

    if (payload.orderBy) find.order = payload.orderBy;
    if (payload.take) find.take = payload.take;
    if (payload.skip) find.skip = payload.skip;
    if (payload.userIds) where.user = { userId: In(payload.userIds) };
    if (payload.kickboardCodes) {
      where.kickboardCode = In(payload.kickboardCodes);
    }

    if (payload.status) where.status = In(payload.status);
    find.where = generateWhere<Rent>(where, payload.search, searchTarget);
    const [rents, total] = await this.rentRepository.findAndCount(find);
    return { rents, total };
  }

  async activateByUser(rent: Rent, payload: ActivateRentDto): Promise<Rent> {
    const { url } = payload;
    if (rent.status !== RentStatus.Shipped) return rent;
    if (!url && !payload.kickboardCode) throw Opcode.CannotActivateRent();
    const kickboardCode =
      payload.kickboardCode || (await this.getKickboardCodeByUrl(payload.url));
    if (rent.kickboardCode !== kickboardCode) throw Opcode.CannotActivateRent();
    await reportMonitoringMetrics('mykickActivate', { rent });
    return this.activate(rent);
  }

  async getKickboardCodeByUrl(url: string): Promise<string> {
    const { redirects } = await superagent(url);
    const redirectUrl = redirects[redirects.length - 1];
    const { searchParams } = new URL(redirectUrl);
    const kickboardCode = searchParams.get('code');
    if (!kickboardCode) throw Opcode.InvalidQrcode();
    return kickboardCode;
  }

  async update(rent: Rent, payload: UpdateRentDto): Promise<Rent> {
    const beforeRent = this.rentRepository.create(rent);
    this.rentRepository.merge(rent, payload);
    if (beforeRent.kickboardCode) {
      if (
        /** Rent has been cancelled or terminated */
        this.detachStatus.includes(rent.status) ||
        /** Or kickboard has been changed */
        rent.kickboardCode !== beforeRent.kickboardCode
      ) {
        await this.detachKickboard(beforeRent);
      }
    }

    if (rent.kickboardCode !== beforeRent.kickboardCode) {
      if (rent.kickboardCode) await this.attachKickboard(rent);
    } else if (rent.maxSpeed !== beforeRent.maxSpeed) {
      await this.changeMaxSpeed(rent);
    }

    if (rent.status !== beforeRent.status) {
      rent = await this.changeStatus(rent, beforeRent.status);
      if (rent.message && !this.messageStatus.includes(rent.status)) {
        this.logger.log(`Deleted the message of ${rent.name}(${rent.rentId})`);
        delete rent.message;
      }

      this.logger.log(
        `${rent.name}(${rent.rentId}) has changed status from ${beforeRent.status} to ${rent.status}`,
      );
    }

    return rent.save();
  }

  async terminate(rent: Rent): Promise<Rent> {
    rent.status = RentStatus.Terminated;
    return rent.save();
  }

  async shipped(rent: Rent): Promise<Rent> {
    rent.status = RentStatus.Shipped;
    rent.remainingMonths--;
    rent.expiredAt = dayjs(rent.expiredAt || undefined)
      .add(30, 'days')
      .toDate();

    const { user } = rent;
    const payment = await this.paymentService.getLastPaymentByRent(rent);
    const card = payment.card || { name: '알 수 없음' };
    await this.phoneService.send(user.phoneNo, 'mykick_arrived', {
      link: 'https://i.hikick.kr/mykick/features',
      rent,
      card,
    });

    return rent.save();
  }

  async activate(rent: Rent): Promise<Rent> {
    rent.status = RentStatus.Activated;
    rent.activatedAt = new Date();
    return rent.save();
  }

  async attachKickboard(rent: Rent): Promise<void> {
    const { kickboardCode } = rent;
    if (!kickboardCode) throw Opcode.NoKickboardInRent();
    const count = await this.rentRepository.count({
      rentId: Not(rent.rentId),
      kickboardCode: kickboardCode,
      status: Not(In([RentStatus.Terminated, RentStatus.Cancelled])),
    });

    if (count > 0) throw Opcode.AlreadyAssignmentKickboard();
    const kickboard = await this.getKickboard(kickboardCode, true);
    await kickboard.update({
      mode: InternalKickboardMode.MYKICK,
      maxSpeed: rent.maxSpeed,
    });

    this.logger.log(
      `${rent.kickboardCode} has been attached with ${rent.name}(${rent.rentId})`,
    );
  }

  async changeMaxSpeed(rent: Rent): Promise<void> {
    const kickboard = await this.getKickboard(rent.kickboardCode, true);
    await kickboard.update({ maxSpeed: rent.maxSpeed });
    this.logger.log(
      `${rent.name}(${rent.rentId}) has been change speed to ${rent.maxSpeed}KM`,
    );
  }

  async detachKickboard(rent: Rent): Promise<void> {
    try {
      const kickboard = await this.getKickboard(rent.kickboardCode);
      await kickboard.update({
        mode: InternalKickboardMode.COLLECTED,
        maxSpeed: null,
      });

      this.logger.log(
        `${rent.kickboardCode} has been detached from ${rent.name}(${rent.rentId})`,
      );
    } catch (err) {
      this.logger.log(
        `${rent.kickboardCode} is already detach from ${rent.name}(${rent.rentId})`,
      );
    }
  }

  async cancel(rent: Rent, refund = false): Promise<Rent> {
    rent.status = RentStatus.Cancelled;
    rent.cancelledAt = new Date();

    if (refund) {
      const reason = rent.message;
      const payments = await this.getPayments(rent);
      await this.paymentService.refundMany(payments, { reason });
    }

    const { phoneNo } = rent.user;
    await this.phoneService.send(phoneNo, 'mykick_cancel', { rent });
    return rent.save();
  }

  async suspended(rent: Rent): Promise<Rent> {
    rent.status = RentStatus.Suspended;
    const { phoneNo } = rent.user;
    await this.phoneService.send(phoneNo, 'mykick_suspended', { rent });
    return rent.save();
  }

  async changeStatus(rent: Rent, previousStatus: RentStatus): Promise<Rent> {
    switch (previousStatus) {
      case RentStatus.Requested:
        return this.changeStatusFromRequested(rent);
      case RentStatus.Shipping:
        return this.changeStatusFromShipping(rent);
      case RentStatus.Shipped:
        return this.changeStatusFromShipped(rent);
      case RentStatus.Activated:
        return this.changeStatusFromActivated(rent);
      case RentStatus.Terminated:
        return this.changeStatusFromTerminated(rent);
      case RentStatus.Suspended:
        return this.changeStatusFromSuspended(rent);
      case RentStatus.Cancelled:
        return this.changeStatusFromCancelled();
    }
  }

  async changeStatusFromRequested(rent: Rent): Promise<Rent> {
    if (rent.status === RentStatus.Shipping) {
      const { user } = rent;
      const payment = await this.paymentService.getLastPaymentByRent(rent);
      const card = payment.card || { name: '알 수 없음' };
      const link = await this.tokenService.generateUrl(
        user,
        `/rents/${rent.rentId}`,
      );

      await this.phoneService.send(user.phoneNo, 'mykick_departed', {
        link,
        rent,
        card,
      });

      return rent;
    }

    if (rent.status === RentStatus.Cancelled) return this.cancel(rent, true);
    throw Opcode.CantChangeRentStatus({
      message: '신청한 렌트는 배송 처리나 취소 처리만 가능합니다.',
    });
  }

  async changeStatusFromShipping(rent: Rent): Promise<Rent> {
    if (rent.status === RentStatus.Shipped) return this.shipped(rent);
    if (rent.status === RentStatus.Cancelled) return this.cancel(rent, true);
    throw Opcode.CantChangeRentStatus({
      message: '배송중인 렌트는 배송 완료 처리나 취소 처리만 가능합니다.',
    });
  }

  async changeStatusFromShipped(rent: Rent): Promise<Rent> {
    if (rent.status === RentStatus.Activated) return this.activate(rent);
    if (rent.status === RentStatus.Cancelled) return this.cancel(rent, true);
    throw Opcode.CantChangeRentStatus({
      message: '배달된 렌트는 활성화하거나 취소 처리만 가능합니다.',
    });
  }

  async changeStatusFromActivated(rent: Rent): Promise<Rent> {
    if (rent.status === RentStatus.Suspended) return this.suspended(rent);
    if (rent.status === RentStatus.Cancelled) return this.cancel(rent);
    if (rent.status === RentStatus.Terminated) return this.terminate(rent);
    throw Opcode.CantChangeRentStatus({
      message: '활성화된 렌트는 정지하거나 취소 또는 종료 처리만 가능합니다.',
    });
  }

  async changeStatusFromTerminated(rent: Rent): Promise<Rent> {
    if (rent.status === RentStatus.Activated) return this.activate(rent);
    throw Opcode.CantChangeRentStatus({
      message: '종료된 렌트는 재개만 가능합니다.',
    });
  }

  async changeStatusFromSuspended(rent: Rent): Promise<Rent> {
    if (rent.status === RentStatus.Activated) return this.activate(rent);
    if (rent.status === RentStatus.Cancelled) return this.cancel(rent);
    if (rent.status === RentStatus.Terminated) return this.terminate(rent);
    throw Opcode.CantChangeRentStatus({
      message: '정지된 렌트는 재개하거나 취소 또는 종료 처리만 가능합니다.',
    });
  }

  async changeStatusFromCancelled(): Promise<Rent> {
    throw Opcode.CantChangeRentStatus({
      message: '취소된 렌트는 재개할 수 없습니다.',
    });
  }
}
