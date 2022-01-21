import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RentModule } from '../rent/rent.module';
import { UserModule } from '../user/user.module';
import { InternalRentController } from './internal-rent/internal-rent.controller';
import { InternalRentMiddleware } from './internal-rent/internal-rent.middleware';
import { InternalUserController } from './internal-user/internal-user.controller';
import { InternalPricingController } from './internal-pricing/internal-pricing.controller';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [UserModule, RentModule, PricingModule],
  controllers: [
    InternalUserController,
    InternalRentController,
    InternalPricingController,
  ],
})
export class InternalModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(InternalRentMiddleware)
      .forRoutes('/:versionId/internal/rents/:rentId');
  }
}
