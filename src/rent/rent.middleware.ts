import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Opcode } from '../common/opcode';
import { RentService } from './rent.service';

@Injectable()
export class RentMiddleware implements NestMiddleware {
  constructor(private readonly rentService: RentService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { user, params } = req;
    if (!user || !params.rentId) throw Opcode.CannotFindRent();
    req.rent = await this.rentService.getOrThrow(params.rentId);
    if (req.rent.user !== user) throw Opcode.CannotFindRent();
    next();
  }
}
