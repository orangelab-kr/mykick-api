import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import _ from 'lodash';

export const PaymentDecorator = createParamDecorator(
  (field: string, ctx: ExecutionContext) => {
    const { payment } = ctx.switchToHttp().getRequest();
    return _.get(payment, field, payment);
  },
);
