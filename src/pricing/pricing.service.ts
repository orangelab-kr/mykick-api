import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opcode } from '../common/opcode';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { Pricing } from './entities/pricing.entity';

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
