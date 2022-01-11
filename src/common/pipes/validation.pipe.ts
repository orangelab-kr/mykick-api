import { ValidationPipe } from '@nestjs/common';
import _ from 'lodash';
import { Opcode } from '../opcode';

export const validationPipe = () =>
  new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (errors) =>
      Opcode.ValidateFailed({
        details: _.chain(errors)
          .keyBy('property')
          .mapValues('constraints')
          .value(),
      }),
  });
