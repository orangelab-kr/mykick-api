import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RentModule } from '../rent/rent.module';
import { UserModule } from '../user/user.module';
import { InternalRentController } from './internal-rent/internal-rent.controller';
import { InternalRentMiddleware } from './internal-rent/internal-rent.middleware';
import { InternalUserController } from './internal-user/internal-user.controller';

@Module({
  imports: [UserModule, RentModule],
  controllers: [InternalUserController, InternalRentController],
})
export class InternalModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(InternalRentMiddleware)
      .forRoutes('/:versionId/internal/rents/:rentId');
  }
}
