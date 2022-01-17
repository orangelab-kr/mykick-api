import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import shortUUID from 'short-uuid';
import { Pricing } from '../../pricing/entities/pricing.entity';

export class EstimateRentDto extends PickType(Pricing, ['pricingId']) {
  @ApiProperty({ example: [shortUUID.generate()] })
  @IsString({ each: true })
  addonIds: string[];
}
