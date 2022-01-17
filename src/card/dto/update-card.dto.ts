import { PartialType, PickType } from '@nestjs/swagger';
import { Card } from '../entities/card.entity';

export class UpdateCardDto extends PartialType(PickType(Card, ['name'])) {}
