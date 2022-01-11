import { PickType } from '@nestjs/swagger';
import { Phone } from '../entities/phone.entity';

export class VerifyPhoneDto extends PickType(Phone, [
  'phoneNo',
  'verifyCode',
]) {}
