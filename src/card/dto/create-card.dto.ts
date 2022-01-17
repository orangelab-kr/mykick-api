import { PickType } from '@nestjs/swagger';
import { Card } from '../entities/card.entity';

export class CreateCardDto extends PickType(Card, [
  'name',
  'type',
  'billingKey',
] as const) {}
