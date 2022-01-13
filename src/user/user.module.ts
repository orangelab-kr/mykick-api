import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { SessionModule } from './session/session.module';
import { SessionService } from './session/session.service';
import { UserController } from './user.controller';
import { UserMiddleware } from './user.middleware';
import { UserService } from './user.service';

@Module({
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService, SessionService],
  imports: [
    SessionModule,
    TypeOrmModule.forFeature([User]),
    RouterModule.register([
      {
        path: 'users',
        module: UserModule,
        children: [
          {
            path: ':userId/sessions',
            module: SessionModule,
          },
        ],
      },
    ]),
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('/:version/users/:userId');
  }
}
