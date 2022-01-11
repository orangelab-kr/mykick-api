import { PickType } from '@nestjs/swagger';
import { Phone } from '../phone/entities/phone.entity';

export class SigninAuthDto extends PickType(Phone, ['phoneId']) {}
