import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddonModule } from '../addon/addon.module';
import { PhoneModule } from '../auth/phone/phone.module';
import { CardModule } from '../card/card.module';
import { PaymentModule } from '../payment/payment.module';
import { PricingModule } from '../pricing/pricing.module';
import { Rent } from './entities/rent.entity';
import { RentController } from './rent.controller';
import { RentMiddleware } from './rent.middleware';
import { RentService } from './rent.service';

@Module({
  exports: [RentService, TypeOrmModule.forFeature([Rent])],
  controllers: [RentController],
  providers: [RentService],
  imports: [
    AddonModule,
    PricingModule,
    PaymentModule,
    CardModule,
    PhoneModule,
    TypeOrmModule.forFeature([Rent]),
  ],
})
export class RentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RentMiddleware)
      .exclude('/:versionId/rents/estimate')
      .forRoutes('/:versionId/rents/:rentId');
  }
}
