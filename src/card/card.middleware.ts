import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Opcode } from '../common/opcode';
import { CardService } from './card.service';

@Injectable()
export class CardMiddleware implements NestMiddleware {
  constructor(private readonly cardService: CardService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = req.user || req.loggined.user;
    const { cardId } = req.params;
    if (!user || !cardId) throw Opcode.CannotFindCard();
    req.card = await this.cardService.getOrThrow(user, cardId);
    next();
  }
}
