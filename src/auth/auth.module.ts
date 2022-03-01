import { Module } from '@nestjs/common';
import { CardModule } from '../card/card.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PhoneModule } from './phone/phone.module';
import { PhoneService } from './phone/phone.service';
import { SessionModule } from './session/session.module';
import { TokenModule } from './token/token.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PhoneService],
  imports: [
    UserModule,
    PhoneModule,
    SessionModule,
    CardModule,
    SessionModule,
    TokenModule,
  ],
})
export class AuthModule {}
