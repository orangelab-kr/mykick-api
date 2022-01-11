import { PickType } from '@nestjs/swagger';
import { Pricing } from '../entities/pricing.entity';

export class CreatePricingDto extends PickType(Pricing, [
  'name',
  'price',
  'periodDays',
] as const) {}
