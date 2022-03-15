import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import shortUUID from 'short-uuid';
import { Pricing } from '../../pricing/entities/pricing.entity';

export class RenewalRentDto extends PickType(Pricing, ['pricingId']) {
  @ApiPropertyOptional({ example: [shortUUID.generate()] })
  @IsString({ each: true })
  @IsOptional()
  addonIds?: string[];
}
