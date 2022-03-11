import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import _ from 'lodash';

export const ProviderDecorator = createParamDecorator(
  (field: string, ctx: ExecutionContext) => {
    const { provider } = ctx.switchToHttp().getRequest();
    return _.get(provider, field, provider);
  },
);
