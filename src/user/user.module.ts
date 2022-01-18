import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardModule } from '../card/card.module';
import { User } from './entities/user.entity';
import { UserMiddleware } from './user.middleware';
import { UserService } from './user.service';

@Module({
  exports: [UserService],
  providers: [UserService],
  imports: [CardModule, TypeOrmModule.forFeature([User])],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('/:version/users/:userId');
  }
}
