import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Opcode } from '../common/opcode';
import { SessionService } from './session/session.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly sessionService: SessionService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;
    if (!authorization) throw Opcode.InvalidSession();
    const [type, token] = authorization.split(' ');
    if (type !== 'Bearer') throw Opcode.InvalidSession();
    const session = await this.sessionService.getTokenOrThrow(token);
    const { user } = session;
    req.loggined = { user, session };
    next();
  }
}
