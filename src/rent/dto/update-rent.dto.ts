import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { IsObject } from 'class-validator';
import { Pricing } from '../../pricing/entities/pricing.entity';
import { User } from '../../user/entities/user.entity';
import { Rent } from '../entities/rent.entity';

export class UpdateRentDto extends PartialType(
  class extends PickType(Rent, [
    'name',
    'status',
    'enabled',
    'message',
    'remainingMonths',
    'kickboardCode',
    'lightOn',
    'activatedAt',
    'expiredAt',
  ] as const) {},
) {
  @ApiPropertyOptional()
  @IsObject()
  user?: User;

  @ApiPropertyOptional()
  @IsObject()
  pricing?: Pricing;
}
