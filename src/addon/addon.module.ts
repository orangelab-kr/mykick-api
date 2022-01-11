import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AddonService } from './addon.service';
import { AddonController } from './addon.controller';
import { Addon } from './entities/addon.entity';
import { AddonMiddleware } from './addon.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Addon])],
  controllers: [AddonController],
  providers: [AddonService],
})
export class AddonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AddonMiddleware).forRoutes('/v1/addons/:addonId');
  }
}
