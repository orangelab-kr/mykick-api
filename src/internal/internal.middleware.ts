import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Opcode } from '../common/opcode';
import { InternalJwtDto } from './dto/internal-jwt.dto';

@Injectable()
export class InternalMiddleware implements NestMiddleware {
  private readonly logger = new Logger(InternalMiddleware.name);

  async use(req: Request, res: Response, next: NextFunction) {
    const { headers, query } = req;
    const token = headers.authorization
      ? headers.authorization.substring(7)
      : query.token;

    if (typeof token !== 'string') throw Opcode.RequiredAccessKey();
    const key = process.env.HIKICK_MYKICK_KEY;
    if (!key || !token) throw Opcode.RequiredAccessKey();

    try {
      const payload: any = jwt.verify(token, key);
      req.internal = plainToClass(InternalJwtDto, payload);
      await validateOrReject(req.internal);

      if (req.internal.exp.diff(req.internal.iat, 'hours') > 6) {
        throw Opcode.RequiredAccessKey();
      }

      this.logger.log(
        `${req.internal.aud}(${req.internal.iss}) - ${req.method} ${req.originalUrl}`,
      );
    } catch (err: any) {
      throw Opcode.RequiredAccessKey();
    }

    next();
  }
}
