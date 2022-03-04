import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Opcode } from '../common/opcode';
import { PaymentService } from './payment.service';

@Injectable()
export class PaymentMiddleware implements NestMiddleware {
  constructor(private readonly paymentService: PaymentService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { paymentId } = req.params;
    const user = req.user || req.loggined.user;
    if (!user || !paymentId) throw Opcode.CannotFindPayment();
    req.payment = await this.paymentService.getOrThrow(user, paymentId);
    next();
  }
}
