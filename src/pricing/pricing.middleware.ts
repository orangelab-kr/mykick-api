import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Opcode } from '../common/opcode';
import { PricingService } from './pricing.service';

@Injectable()
export class PricingMiddleware implements NestMiddleware {
  constructor(private readonly pricingService: PricingService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { pricingId } = req.params;
    if (!pricingId) throw Opcode.CannotFindPricing();
    req.pricing = await this.pricingService.findOneOrThrow(pricingId);
    next();
  }
}
