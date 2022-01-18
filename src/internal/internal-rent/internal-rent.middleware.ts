import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Opcode } from '../../common/opcode';
import { RentService } from '../../rent/rent.service';

@Injectable()
export class InternalRentMiddleware implements NestMiddleware {
  constructor(private readonly rentService: RentService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { rentId } = req.params;
    if (!rentId) throw Opcode.CannotFindRent();
    req.rent = await this.rentService.getOrThrow(rentId);
    next();
  }
}
