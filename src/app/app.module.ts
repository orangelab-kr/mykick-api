import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AddonModule } from '../addon/addon.module';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { CardModule } from '../card/card.module';
import { LoggerMiddleware } from '../common/middlewares/logger.middleware';
import { DatabaseModule } from '../database/database.module';
import { PricingModule } from '../pricing/pricing.module';
import { RentModule } from '../rent/rent.module';
import { SessionModule } from '../user/session/session.module';
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
        /** Auth */
        { path: '/:version/auth/signin', method: RequestMethod.POST },
        { path: '/:version/auth/signup', method: RequestMethod.POST },
        /** Pricings */
        { path: '/:version/pricings', method: RequestMethod.GET },
        { path: '/:version/pricings/:pricingId', method: RequestMethod.GET },
        /** Addon */
        { path: '/:version/addons', method: RequestMethod.GET },
        { path: '/:version/addons/:pricingId', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
