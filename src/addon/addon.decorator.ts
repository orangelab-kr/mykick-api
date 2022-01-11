import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import _ from 'lodash';

export const AddonDecorator = createParamDecorator(
  (field: string, ctx: ExecutionContext) => {
    const { addon } = ctx.switchToHttp().getRequest();
    return _.get(addon, field, addon);
  },
);
