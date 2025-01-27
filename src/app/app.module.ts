import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AddonModule } from '../addon/addon.module';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { SessionModule } from '../auth/session/session.module';
import { CardModule } from '../card/card.module';
import { LoggerMiddleware } from '../common/middlewares/logger.middleware';
import { DatabaseModule } from '../common/modules/database.module';
import { InternalModule } from '../internal/internal.module';
import { PricingModule } from '../pricing/pricing.module';
import { RentModule } from '../rent/rent.module';
import { UserModule } from '../user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    DatabaseModule,
    PricingModule,
    AddonModule,
    UserModule,
    AuthModule,
    SessionModule,
    RentModule,
    CardModule,
    InternalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');

    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: '/', method: RequestMethod.GET },
        /** Internal */
        { path: '/:version/internal/(.*)', method: RequestMethod.ALL },
        /** Auth */
        { path: '/:version/auth/token', method: RequestMethod.GET },
        { path: '/:version/auth/signin', method: RequestMethod.POST },
        { path: '/:version/auth/signup', method: RequestMethod.POST },
        /** PHONE  */
        { path: '/:version/auth/phone', method: RequestMethod.GET },
        { path: '/:version/auth/phone', method: RequestMethod.POST },
        /** Pricings */
        { path: '/:version/pricings', method: RequestMethod.GET },
        { path: '/:version/pricings/:pricingId', method: RequestMethod.GET },
        /** Addons */
        { path: '/:version/addons', method: RequestMethod.GET },
        { path: '/:version/addons/:addonId', method: RequestMethod.GET },
        /** Rents */
        { path: '/:version/rents/estimate', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
