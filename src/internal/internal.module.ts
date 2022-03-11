import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AddonModule } from '../addon/addon.module';
import { PaymentMiddleware } from '../payment/payment.middleware';
import { PaymentModule } from '../payment/payment.module';
import { PricingMiddleware } from '../pricing/pricing.middleware';
import { PricingModule } from '../pricing/pricing.module';
import { ProviderMiddleware } from '../provider/provider.middleware';
import { ProviderModule } from '../provider/provider.module';
import { RentModule } from '../rent/rent.module';
import { UserModule } from '../user/user.module';
import { InternalAddonController } from './internal-addon/internal-addon.controller';
import { InternalAddonMiddleware } from './internal-addon/internal-addon.middleware';
import { InternalPricingController } from './internal-pricing/internal-pricing.controller';
import { InternalProviderController } from './internal-provider/internal-provider.controller';
import { InternalRentController } from './internal-rent/internal-rent.controller';
import { InternalRentMiddleware } from './internal-rent/internal-rent.middleware';
import { InternalUserController } from './internal-user/internal-user.controller';
import { InternalUserMiddleware } from './internal-user/internal-user.middleware';
import { InternalMiddleware } from './internal.middleware';

@Module({
  imports: [
    UserModule,
    RentModule,
    PricingModule,
    AddonModule,
    PaymentModule,
    ProviderModule,
  ],
  controllers: [
    InternalUserController,
    InternalRentController,
    InternalPricingController,
    InternalAddonController,
    InternalProviderController,
  ],
})
export class InternalModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(InternalMiddleware)
      .forRoutes('/:versionId/internal/*')
      .apply(InternalRentMiddleware)
      .forRoutes('/:versionId/internal/rents/:rentId')
      .apply(InternalAddonMiddleware)
      .forRoutes('/:versionId/internal/addons/:addonId')
      .apply(InternalUserMiddleware)
      .forRoutes('/:versionId/internal/users/:userId')
      .apply(PaymentMiddleware)
      .forRoutes('/:versionId/internal/users/:userId/payments/:paymentId')
      .apply(ProviderMiddleware)
      .forRoutes('/:versionId/internal/providers/:providerId')
      .apply(PricingMiddleware)
      .forRoutes('/:versionId/internal/pricings/:pricingId');
  }
}
