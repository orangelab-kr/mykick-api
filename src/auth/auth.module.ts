import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PhoneModule } from './phone/phone.module';
import { PhoneService } from './phone/phone.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PhoneService],
  imports: [UserModule, PhoneModule],
})
export class AuthModule {}
