import { PickType } from '@nestjs/swagger';
import { Pricing } from '../entities/pricing.entity';

export class CreatePricingDto extends PickType(Pricing, [
  'name',
  'monthlyPrice',
  'periodMonths',
] as const) {}
