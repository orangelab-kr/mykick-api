import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pricing } from './entities/pricing.entity';
import { PricingController } from './pricing.controller';
import { PricingMiddleware } from './pricing.middleware';
import { PricingService } from './pricing.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pricing])],
  controllers: [PricingController],
  providers: [PricingService],
})
export class PricingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PricingMiddleware)
      .forRoutes('/:version/pricings/:pricingId');
  }
}
