import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { CreatePricingDto } from 'src/pricing/dto/create-pricing.dto';
import { UpdatePricingDto } from 'src/pricing/dto/update-pricing.dto';
import { Pricing } from 'src/pricing/entities/pricing.entity';
import { Repository } from 'typeorm';
import { Opcode } from '../common/opcode';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Pricing)
    private readonly pricingRepository: Repository<Pricing>,
  ) {}

  async create(payload: CreatePricingDto) {
    const pricing = await this.getByName(payload.name);
    if (pricing) throw Opcode.ExistsPricingName({ pricing });
    return this.pricingRepository.create(payload).save();
  }

  async getByName(name: string): Promise<Pricing | null> {
    return this.pricingRepository.findOne({ name });
  }

  async findAll(): Promise<Pricing[]> {
    return this.pricingRepository.find();
  }

  async findOne(pricingId: string): Promise<Pricing | null> {
    return this.pricingRepository.findOne({ pricingId });
  }

  async findOneOrThrow(pricingId: string): Promise<Pricing> {
    const pricing = await this.findOne(pricingId);
    if (!pricing) throw Opcode.CannotFindPricing();
    return pricing;
  }

  async update(pricing: Pricing, payload: UpdatePricingDto): Promise<Pricing> {
    return this.pricingRepository.merge(pricing, payload).save();
  }

  async remove(pricing: Pricing): Promise<void> {
    await pricing.remove();
  }
}
