import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardController } from './card.controller';
import { CardMiddleware } from './card.middleware';
import { CardService } from './card.service';
import { Card } from './entities/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card])],
  exports: [TypeOrmModule.forFeature([Card]), CardService],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CardMiddleware)
      .exclude(
        '/:version/users/:userId/cards/sync',
        '/:version/users/:userId/cards/checkout',
        '/:version/auth/cards/sync',
        '/:version/auth/cards/checkout',
      )
      .forRoutes(
        '/:version/users/:userId/cards/:cardId',
        '/:version/auth/cards/:cardId',
      );
  }
}
