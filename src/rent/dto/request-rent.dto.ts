import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Pricing } from '../../pricing/entities/pricing.entity';
import { Rent } from '../entities/rent.entity';

export class RequestRentDto extends IntersectionType(
  class extends PickType(Pricing, ['pricingId'] as const) {},
  class extends PickType(Rent, ['name'] as const) {},
) {
  @ApiProperty({ example: ['7heP5xtMP5fitNP92dP56P'] })
  @IsString({ each: true })
  addonIds: string[];
}
