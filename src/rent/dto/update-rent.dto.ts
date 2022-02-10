import { PartialType, PickType } from '@nestjs/swagger';
import { Rent } from '../entities/rent.entity';

export class UpdateRentDto extends PartialType(
  class extends PickType(Rent, [
    'name',
    'status',
    'enabled',
    'remainingMonths',
    'kickboardCode',
    'lightOn',
    'activatedAt',
    'expiredAt',
  ] as const) {},
) {}
