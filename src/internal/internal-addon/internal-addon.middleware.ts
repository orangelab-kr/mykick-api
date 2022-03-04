import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AddonService } from '../../addon/addon.service';
import { Opcode } from '../../common/opcode';

@Injectable()
export class InternalAddonMiddleware implements NestMiddleware {
  constructor(private readonly addonService: AddonService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { rentId } = req.params;
    if (!rentId) throw Opcode.CannotFindAddon();
    req.addon = await this.addonService.get(rentId);
    next();
  }
}
