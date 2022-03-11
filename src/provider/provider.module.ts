import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from './entities/provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Provider])],
  exports: [TypeOrmModule.forFeature([Provider]), ProviderService],
  providers: [ProviderService],
})
export class ProviderModule {}
