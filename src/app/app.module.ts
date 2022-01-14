import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AddonModule } from '../addon/addon.module';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { LoggerMiddleware } from '../common/middlewares/logger.middleware';
import { DatabaseModule } from '../database/database.module';
import { PricingModule } from '../pricing/pricing.module';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');

    consumer
      .apply(AuthMiddleware)
      .exclude('/', 'auth/signin', 'auth/signup', 'pricings')
      .forRoutes('*');
  }
}
