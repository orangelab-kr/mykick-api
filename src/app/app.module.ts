import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/database.module';
import { PricingModule } from '../pricing/pricing.module';
import { AddonModule } from '../addon/addon.module';

@Module({
  imports: [DatabaseModule, PricingModule, AddonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
