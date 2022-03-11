import {
  ApiPropertyOptional,
  IntersectionType,
  PickType,
} from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Rent } from '../entities/rent.entity';
import { EstimateRentDto } from './estimate-rent.dto';

export class RequestRentDto extends IntersectionType(
  EstimateRentDto,
  class extends PickType(Rent, ['name']) {},
) {
  @ApiPropertyOptional({ example: 'cc' })
  @IsString()
  @IsOptional()
  providerCode?: string;
}
