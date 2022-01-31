import { IntersectionType, PickType } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { Phone } from '../phone/entities/phone.entity';

export class SignupAuthDto extends IntersectionType(
  class extends PickType(User, ['name', 'address', 'idcard'] as const) {},
  class extends PickType(Phone, ['phoneId'] as const) {},
) {}
