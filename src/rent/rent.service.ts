import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddonService } from '../addon/addon.service';
import { PricingService } from '../pricing/pricing.service';
import { User } from '../user/entities/user.entity';
import { RequestRentDto } from './dto/request-rent.dto';
import { Rent } from './entities/rent.entity';

@Injectable()
export class RentService {
  constructor(
    @InjectRepository(Rent)
    private readonly rentRepository: Repository<Rent>,
    private readonly pricingService: PricingService,
    private readonly addonService: AddonService,
  ) {}

  async request(user: User, payload: RequestRentDto) {
    const { name, pricingId, addonIds } = payload;
    const [pricing, addons] = await Promise.all([
      this.pricingService.findOneOrThrow(pricingId),
      this.addonService.getMany(addonIds),
    ]);

    const remainingMonths = pricing.periodMonths;
    await this.rentRepository
      .create({ name, user, pricing, addons, remainingMonths })
      .save();
  }

  async getMany(user: User): Promise<{ rents: Rent[]; total: number }> {
    const [rents, total] = await this.rentRepository.findAndCount({ user });
    return { rents, total };
  }
}
