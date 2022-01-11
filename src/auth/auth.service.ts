import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { PhoneService } from './phone/phone.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly phoneService: PhoneService,
  ) {}

  async signup(payload: SignupAuthDto): Promise<User> {
    const phone = await this.phoneService.findOneOrThrow(payload.phoneId);
    const data = _.merge(_.omit(payload, 'phoneId'), _.pick(phone, 'phoneNo'));
    const user = await this.userService.create(data);
    await this.phoneService.revoke(phone);
    return user;
  }
}
