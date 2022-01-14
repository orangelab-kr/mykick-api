import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import _ from 'lodash';
import { Opcode } from '../../common/opcode';

export const CardDecorator = createParamDecorator(
  (field: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    if (!req.card) throw Opcode.CannotFindCard();
    return _.get(req.card, field, req.card);
  },
);
