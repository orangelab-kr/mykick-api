import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Opcode } from '../../common/opcode';
import { UserService } from '../../user/user.service';

@Injectable()
export class InternalUserMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.params;
    if (!userId) throw Opcode.CannotFindRent();
    req.user = await this.userService.findOne(userId);
    next();
  }
}
