import { IntersectionType, PickType } from '@nestjs/swagger';
import { Card } from '../../card/entities/card.entity';
import { RequestRentDto } from './request-rent.dto';

export class RequestAndPayRentDto extends IntersectionType(
  class extends PickType(Card, ['cardId'] as const) {},
  class extends RequestRentDto {},
) {}
