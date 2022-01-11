import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import _ from 'lodash';

export const UserDecorator = createParamDecorator(
  (field: string, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest();
    return _.get(user, field, user);
  },
);
