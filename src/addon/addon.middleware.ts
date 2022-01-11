import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Opcode } from '../common/opcode';
import { AddonService } from './addon.service';

@Injectable()
export class AddonMiddleware implements NestMiddleware {
  constructor(private readonly addonService: AddonService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { addonId } = req.params;
    if (!addonId) throw Opcode.CannotFindPricing();
    req.addon = await this.addonService.findOneOrThrow(addonId);
    next();
  }
}
