import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { Phone } from '../entities/phone.entity';

export class RequestPhoneDto extends PickType(Phone, ['phoneNo'] as const) {
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @ApiPropertyOptional({ description: '디버깅 모드(미전송)', example: false })
  @IsBoolean({ message: '올바른 값이 아닙니다.' })
  debug: boolean = false;
}
