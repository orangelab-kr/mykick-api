import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CancelPaymentDto {
  @IsString()
  @ApiProperty({ example: '실수 환불 요청' })
  reason: string;
}
