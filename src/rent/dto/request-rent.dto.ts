import { IntersectionType, PickType } from '@nestjs/swagger';
import { Rent } from '../entities/rent.entity';
import { EstimateRentDto } from './estimate-rent.dto';

export class RequestRentDto extends IntersectionType(
  EstimateRentDto,
  class extends PickType(Rent, ['name']) {},
) {}
