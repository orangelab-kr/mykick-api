import { Injectable, Logger } from '@nestjs/common';
import _ from 'lodash';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { SigninAuthDto } from './dto/signin-auth.dto';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Phone } from './phone/entities/phone.entity';
import { PhoneService } from './phone/phone.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly phoneService: PhoneService,
  ) {}

  async update(user: User, payload: UpdateAuthDto): Promise<User> {
    let phone: Phone | undefined;
    const updatePayload: UpdateUserDto = {};
    if (payload.phoneId) {
      phone = await this.phoneService.findOneOrThrow(payload.phoneId);
      updatePayload.phoneNo = phone.phoneNo;
      this.logger.log(
        `${user.name}(${user.userId}) has been updated phone number.`,
      );
    }

    if (phone) await this.phoneService.revoke(phone);
    const updatedUser = await this.userService.update(user, payload);
    this.logger.log(
      `${user.name}(${user.userId}) has been successfully update!`,
    );

    return updatedUser;
  }

  async signin(payload: SigninAuthDto): Promise<User> {
    const phone = await this.phoneService.findOneOrThrow(payload.phoneId);
    const user = await this.userService.getByPhoneOrThrow(phone.phoneNo);
    await this.phoneService.revoke(phone);
    this.logger.log(
      `${user.name}(${user.userId}) has been successfully sign in!`,
    );

    return user;
  }

  async signup(payload: SignupAuthDto): Promise<User> {
    const phone = await this.phoneService.findOneOrThrow(payload.phoneId);
    const data = _.merge(_.omit(payload, 'phoneId'), _.pick(phone, 'phoneNo'));
    const user = await this.userService.create(data);
    await this.phoneService.revoke(phone);
    this.logger.log(
      `${user.name}(${user.userId}) has been successfully sign up!`,
    );

    return user;
  }
}
