import { Module } from '@nestjs/common';
import { AddonModule } from '../addon/addon.module';
import { DatabaseModule } from '../database/database.module';
import { PricingModule } from '../pricing/pricing.module';
import { UserModule } from '../user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [DatabaseModule, PricingModule, AddonModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
