import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import _ from 'lodash';
import superagent from 'superagent';
import { FindConditions, FindManyOptions, In, Repository } from 'typeorm';
import { AddonService } from '../addon/addon.service';
import { CardService } from '../card/card.service';
import { Opcode } from '../common/opcode';
import { generateWhere, WhereType } from '../common/tools/generate-where';
import { Payment, PaymentItem } from '../payment/entities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { PricingService } from '../pricing/pricing.service';
import { User } from '../user/entities/user.entity';
import { ActivateRentDto } from './dto/activate-rent.dto';
import { EstimateRentDto } from './dto/estimate-rent.dto';
import { GetRentsDto } from './dto/get-rents.dto';
import { RequestAndPayRentDto } from './dto/request-and-pay-rent.dto';
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
    private readonly cardService: CardService,
  ) {}

  async requestAndPay(
    user: User,
    payload: RequestAndPayRentDto,
  ): Promise<Rent> {
    const card = await this.cardService.getOrThrow(user, payload.cardId);
    const rent = await this.request(user, _.omit(payload, 'cardId'));

    try {
      const month = dayjs().month() + 1;
      const name = `${month}월달 이용료(첫 이용❤️)`;
      const items = this.paymentService.generateItems(rent, true);
      await this.paymentService.purchase(user, { name, card, items, rent });
    } catch (err) {
      await this.remove(rent);
      this.logger.warn(
        `${user.name}(${user.userId}) has failed to pay and the rent is cancelled.`,
      );

      throw err;
    }

    return rent;
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

  async remove(rent: Rent) {
    await rent.remove();
  }

  async getManyByUser(user: User): Promise<{ rents: Rent[]; total: number }> {
    const [rents, total] = await this.rentRepository.findAndCount({ user });
    return { rents, total };
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
    if (rent.status !== RentStatus.Shipped) throw Opcode.CannotActivateRent();
    const kickboardCode = await this.getKickboardCodeByUrl(payload.url);
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
      .add(1, 'month')
      .toDate();

    // TODO: 알림톡(배송 완료)
    this.logger.debug('배송완료 메세지 전송');
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
    if (refund) {
      const payments = await this.getPayments(rent);
      await this.paymentService.refundMany(payments);
      this.logger.debug('전체 환불 완료!');
    }

    // TODO: 알림톡(취소)
    this.logger.debug('취소 메세지 전송');
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
      // TODO: 승인(알림톡)
      this.logger.debug('승인 메세지 전송 완료!');
      return rent;
    }

    if (rent.status === RentStatus.Cancelled) this.cancel(rent, true);
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
    if (rent.status === RentStatus.Suspended) return rent;
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
