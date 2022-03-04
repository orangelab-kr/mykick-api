import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelPaymentDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: '실수 환불 요청' })
  reason?: string;
}
