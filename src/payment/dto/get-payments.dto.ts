import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import shortUUID from 'short-uuid';
import { TransferArray } from '../../common/decorators/transfer-array';
import { RequestOrderByDto } from '../../common/dto/request-order-by.dto';
import { RequestPagniationDto } from '../../common/dto/request-pagniation.dto';
import { RequestSearchDto } from '../../common/dto/request-search.dto';
import { Payment } from '../entities/payment.entity';

export class GetPaymentsDto extends IntersectionType(
  IntersectionType(RequestPagniationDto, RequestSearchDto),
  class extends RequestOrderByDto<
    Payment,
    'name' | 'amount' | 'cancelledAt' | 'createdAt' | 'updatedAt'
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
    description: '렌트',
    example: [shortUUID().generate()],
  })
  @IsArray()
  @IsOptional()
  @TransferArray()
  @IsString({ each: true })
  rentIds?: string[];
}
