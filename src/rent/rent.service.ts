import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import _ from 'lodash';
import {
  InternalKickboard,
  InternalKickboardMode,
  InternalKickboardStatus,
} from 'openapi-internal-sdk';
import superagent from 'superagent';
import { FindConditions, FindManyOptions, In, Repository } from 'typeorm';
import { AddonService } from '../addon/addon.service';
import { PhoneService } from '../auth/phone/phone.service';
import { InternalClient } from '../common/internalClient';
import { Opcode } from '../common/opcode';
import { generateWhere, WhereType } from '../common/tools/generate-where';
import { Payment, PaymentItem } from '../payment/entities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { PricingService } from '../pricing/pricing.service';
import { User } from '../user/entities/user.entity';
import { ActivateRentDto } from './dto/activate-rent.dto';
import { EstimateRentDto } from './dto/estimate-rent.dto';
import { GetRentsDto } from './dto/get-rents.dto';
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
    private readonly paymentService: PaymentService,
    private readonly phoneService: PhoneService,
  ) {}

  async requestAndPay(user: User, payload: RequestRentDto): Promise<Rent> {
    let payment: Payment | undefined;
    const rent = await this.request(user, _.omit(payload, 'cardId'));

    try {
      const month = dayjs().month() + 1;
      const name = `${month}월달 이용료(첫 이용❤️)`;
      const items = this.paymentService.generateItems(rent, true);
      payment = await this.paymentService.purchase(user, { name, items, rent });
    } catch (err) {
      await this.remove(rent);
      this.logger.warn(
        `${user.name}(${user.userId}) has failed to pay and the rent is cancelled.`,
      );

      throw err;
    }

    const { card } = payment;
    await this.phoneService.send(user.phoneNo, 'mykick_requested', {
      link: 'https://my.hikick.kr',
      rent,
      card,
    });

    return rent;
  }

  async control(rent: Rent, enabled: boolean): Promise<Rent> {
    if (rent.status === RentStatus.Cancelled) throw Opcode.RentHasSuspended();
    const kickboard = await this.getKickboardByRent(rent);
    enabled ? await kickboard.start() : await kickboard.stop();
    return this.update(rent, { enabled });
  }

  async getStatus(
    rent: Rent,
  ): Promise<Pick<InternalKickboardStatus, 'gps' | 'createdAt' | 'power'>> {
    return this.getKickboardByRent(rent)
      .then((k) => k.getLatestStatus())
      .then((status) => _.pick(status, 'gps', 'createdAt', 'power'));
  }

  async alarm(rent: Rent): Promise<Rent> {
    if (rent.status === RentStatus.Cancelled) throw Opcode.RentHasSuspended();
    const kickboard = await this.getKickboardByRent(rent);
    if (!rent.enabled) await kickboard.start();
    await kickboard.alarmOn({ seconds: 5000 });
    if (!rent.enabled) await kickboard.stop();
    return rent;
  }

  async light(rent: Rent, lightOn: boolean): Promise<Rent> {
    if (rent.status === RentStatus.Cancelled) throw Opcode.RentHasSuspended();
    const kickboard = await this.getKickboardByRent(rent);
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
    const { name } = payload;
    const rent = await this.getEstimate(_.omit(payload, 'name'));
    this.logger.log(`${user.name}(${user.userId}) has been requested new rent`);
    return this.rentRepository.merge(rent, { user, name }).save();
  }

  async getKickboardByRent(
    rent: Rent,
    bypassModeValidate = false,
  ): Promise<InternalKickboard> {
    try {
      const client = InternalClient.getKickboard();
      const kickboard = await client.getKickboard(rent.kickboardCode);
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
    if (payload.status) where.status = In(payload.status);
    find.where = generateWhere<Rent>(where, payload.search, searchTarget);
    const [rents, total] = await this.rentRepository.findAndCount(find);
    return { rents, total };
  }

  async activateByUser(rent: Rent, payload: ActivateRentDto): Promise<Rent> {
    const { url } = payload;
    if (rent.status !== RentStatus.Shipped) throw Opcode.CannotActivateRent();
    if (!url && !payload.kickboardCode) throw Opcode.CannotActivateRent();
    const kickboardCode =
      payload.kickboardCode || (await this.getKickboardCodeByUrl(payload.url));
    if (rent.kickboardCode !== kickboardCode) throw Opcode.CannotActivateRent();
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
    const beforeStatus = rent.status;
    let updatedRent = this.rentRepository.merge(rent, payload);
    if (updatedRent.status !== beforeStatus) {
      updatedRent = await this.changeStatus(updatedRent, beforeStatus);
      if (
        updatedRent.status !== RentStatus.Cancelled &&
        updatedRent.status !== RentStatus.Suspended
      ) {
        delete updatedRent.message;
      }

      this.logger.log(
        `${rent.name}(${rent.rentId}) has changed status from ${beforeStatus} to ${updatedRent.status}`,
      );
    }

    return updatedRent.save();
  }

  async shipped(rent: Rent): Promise<Rent> {
    rent.status = RentStatus.Shipped;
    rent.remainingMonths--;
    rent.expiredAt = dayjs(rent.expiredAt || undefined)
      .add(30, 'days')
      .toDate();

    const { phoneNo } = rent.user;
    const payment = await this.paymentService.getLastPaymentByRent(rent);
    const card = payment.card || { name: '알 수 없음' };
    await this.phoneService.send(phoneNo, 'mykick_arrived', {
      link: 'https://my.hikick.kr',
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

  async cancel(rent: Rent, refund = false): Promise<Rent> {
    rent.status = RentStatus.Cancelled;
    rent.cancelledAt = new Date();

    if (rent.kickboardCode) {
      const kickboard = await this.getKickboardByRent(rent);
      await kickboard.update({ mode: InternalKickboardMode.COLLECTED });
    }

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
      if (!rent.kickboardCode) throw Opcode.NoKickboardInRent();
      const kickboard = await this.getKickboardByRent(rent, true);
      await kickboard.update({ mode: InternalKickboardMode.MYKICK });

      const { phoneNo } = rent.user;
      const payment = await this.paymentService.getLastPaymentByRent(rent);
      const card = payment.card || { name: '알 수 없음' };
      await this.phoneService.send(phoneNo, 'mykick_departed', {
        link: 'https://my.hikick.kr',
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
    throw Opcode.CantChangeRentStatus({
      message: '활성화된 렌트는 정지하거나 취소 처리만 가능합니다.',
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
    throw Opcode.CantChangeRentStatus({
      message: '정지된 렌트는 재개하거나 취소만 가능합니다.',
    });
  }

  async changeStatusFromCancelled(): Promise<Rent> {
    throw Opcode.CantChangeRentStatus({
      message: '취소된 렌트는 재개할 수 없습니다.',
    });
  }
}
