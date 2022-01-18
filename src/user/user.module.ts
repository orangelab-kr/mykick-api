import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardModule } from '../card/card.module';
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
  imports: [SessionModule, CardModule, TypeOrmModule.forFeature([User])],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('/:version/users/:userId');
  }
}
