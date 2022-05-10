import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import shortUUID from 'short-uuid';
import { TransferArray } from '../../common/decorators/transfer-array';
import { RequestOrderByDto } from '../../common/dto/request-order-by.dto';
import { RequestPagniationDto } from '../../common/dto/request-pagniation.dto';
import { RequestSearchDto } from '../../common/dto/request-search.dto';
import { Rent, RentStatus } from '../entities/rent.entity';

export class GetRentsDto extends IntersectionType(
  IntersectionType(RequestPagniationDto, RequestSearchDto),
  class extends RequestOrderByDto<
    Rent,
    | 'name'
    | 'remainingMonths'
    | 'expiredAt'
    | 'activatedAt'
    | 'createdAt'
    | 'updatedAt'
  > {},
) {
  @ApiPropertyOptional({
    isArray: true,
    description: '사용자',
    example: [shortUUID().generate()],
  })
  @IsArray()
  @IsOptional()
  @TransferArray()
  @IsString({ each: true })
  userIds?: string[];

  @ApiPropertyOptional({
    isArray: true,
    description: '상태',
    enum: RentStatus,
  })
  @IsArray()
  @IsOptional()
  @TransferArray()
  @IsEnum(RentStatus, { each: true })
  status?: RentStatus[];

  @ApiPropertyOptional({
    isArray: true,
    description: '킥보드 코드',
    example: ['DE20KP'],
  })
  @IsArray()
  @IsOptional()
  @TransferArray()
  @IsString({ each: true })
  kickboardCodes?: string[];
}
