import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import _ from 'lodash';

export const PricingDecorator = createParamDecorator(
  (field: string, ctx: ExecutionContext) => {
    const { pricing } = ctx.switchToHttp().getRequest();
    return _.get(pricing, field, pricing);
  },
);
