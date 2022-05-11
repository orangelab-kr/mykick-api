import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { catchError, map, Observable, throwError } from 'rxjs';
import * as Sentry from '@sentry/node';
import { $, Opcode } from '../opcode';

export class WrapperRes {
  @ApiProperty({ example: 0 })
  opcode: number;
}

@Injectable()
export class WrapperInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const pipe = map((data: any) => ({ opcode: 0, ...data }));
    const errorPipe = catchError((err) => {
      if (err.name === 'InternalError') {
        const error = $(err.opcode, 500, err.message);
        return throwError(() => error(err.details));
      }

      if (err.name !== 'HttpException') {
        const eventId = Sentry.captureException(err);
        return throwError(() => Opcode.InvalidError({ eventId }));
      }

      return throwError(() => err);
    });

    return next.handle().pipe(errorPipe).pipe(pipe);
  }
}
