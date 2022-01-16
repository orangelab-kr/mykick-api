import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddonModule } from '../addon/addon.module';
import { PricingModule } from '../pricing/pricing.module';
import { Rent } from './entities/rent.entity';
import { RentController } from './rent.controller';
import { RentService } from './rent.service';

@Module({
  exports: [RentService],
  controllers: [RentController],
  providers: [RentService],
  imports: [
    AddonModule,
    PricingModule,
    TypeOrmModule.forFeature([Rent]),
    RouterModule.register([
      {
        path: 'rents',
        module: RentModule,
      },
    ]),
  ],
})
export class RentModule {}
