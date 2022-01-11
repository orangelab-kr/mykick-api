import { PickType } from '@nestjs/swagger';
import { Addon } from '../entities/addon.entity';

export class CreateAddonDto extends PickType(Addon, [
  'name',
  'price',
  'periodDays',
] as const) {}
