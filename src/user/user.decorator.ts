import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import _ from 'lodash';
import { Opcode } from '../common/opcode';

export const UserDecorator = createParamDecorator(
  (field: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user || req.loggined.user;
    if (!user) throw Opcode.CannotFindUser();
    return _.get(user, field, user);
  },
);
