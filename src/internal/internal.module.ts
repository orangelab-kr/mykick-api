import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PricingModule } from '../pricing/pricing.module';
import { RentModule } from '../rent/rent.module';
import { UserModule } from '../user/user.module';
import { InternalPricingController } from './internal-pricing/internal-pricing.controller';
import { InternalRentController } from './internal-rent/internal-rent.controller';
import { InternalRentMiddleware } from './internal-rent/internal-rent.middleware';
import { InternalUserMiddleware } from './internal-user/internal-rent.middleware';
import { InternalUserController } from './internal-user/internal-user.controller';
import { InternalMiddleware } from './internal.middleware';
import { InternalAddonController } from './internal-addon/internal-addon.controller';
import { InternalAddonMiddleware } from './internal-addon/internal-addon';
import { AddonModule } from '../addon/addon.module';

@Module({
  imports: [UserModule, RentModule, PricingModule, AddonModule],
  controllers: [
    InternalUserController,
    InternalRentController,
    InternalPricingController,
    InternalAddonController,
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
      .forRoutes('/:versionId/internal/users/:userId');
  }
}
