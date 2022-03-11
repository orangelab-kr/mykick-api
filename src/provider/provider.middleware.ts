import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Opcode } from '../common/opcode';
import { ProviderService } from './provider.service';

@Injectable()
export class ProviderMiddleware implements NestMiddleware {
  constructor(private readonly providerService: ProviderService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { providerId } = req.params;
    if (!providerId) throw Opcode.CannotFindProvider();
    req.provider = await this.providerService.findOneOrThrow(providerId);
    next();
  }
}
