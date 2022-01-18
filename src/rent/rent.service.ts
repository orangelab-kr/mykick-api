import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import _ from 'lodash';
import { Repository } from 'typeorm';
import { AddonService } from '../addon/addon.service';
import { CardService } from '../card/card.service';
import { PaymentService } from '../payment/payment.service';
import { PricingService } from '../pricing/pricing.service';
import { User } from '../user/entities/user.entity';
import { RequestAndPayRentDto } from './dto/request-and-pay-rent.dto';
import { RequestRentDto } from './dto/request-rent.dto';
import { Rent } from './entities/rent.entity';

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

  async request(user: User, payload: RequestRentDto) {
    const { name, pricingId, addonIds } = payload;
    const [pricing, addons] = await Promise.all([
      this.pricingService.findOneOrThrow(pricingId),
      this.addonService.getMany(addonIds),
    ]);

    const remainingMonths = pricing.periodMonths;
    this.logger.log(`${user.name}(${user.userId}) has been requested new rent`);
    return this.rentRepository
      .create({ name, user, pricing, addons, remainingMonths })
      .save();
  }

  async remove(rent: Rent) {
    await rent.remove();
  }

  async getMany(user: User): Promise<{ rents: Rent[]; total: number }> {
    const [rents, total] = await this.rentRepository.findAndCount({ user });
    return { rents, total };
  }
}
