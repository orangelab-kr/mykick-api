import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { SessionModule } from '../user/session/session.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PhoneModule } from './phone/phone.module';
import { PhoneService } from './phone/phone.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PhoneService],
  imports: [
    UserModule,
    PhoneModule,
    SessionModule,
    RouterModule.register([
      {
        path: 'auth',
        module: AuthModule,
        children: [
          {
            path: 'sessions',
            module: SessionModule,
          },
        ],
      },
    ]),
  ],
})
export class AuthModule {}
