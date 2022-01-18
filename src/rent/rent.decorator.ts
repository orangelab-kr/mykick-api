import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import _ from 'lodash';
import { Opcode } from '../common/opcode';

export const RentDecorator = createParamDecorator(
  (field: string, ctx: ExecutionContext) => {
    const { rent } = ctx.switchToHttp().getRequest();
    if (!rent) throw Opcode.CannotFindRent();
    return _.get(rent, field, rent);
  },
);
