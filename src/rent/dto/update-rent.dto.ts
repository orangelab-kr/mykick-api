import { PartialType, PickType } from '@nestjs/swagger';
import { RequestRentDto } from './request-rent.dto';

export class UpdateRentDto extends PartialType(
  PickType(RequestRentDto, ['name'] as const),
) {}
