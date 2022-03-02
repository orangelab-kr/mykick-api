import _ from 'lodash';
import {
  BaseEntity,
  Equal,
  FindCondition,
  FindConditions,
  FindOperator,
  Like,
} from 'typeorm';

export type WhereTypeFunc = (t: string) => FindOperator<any>;
export const WhereType = {
  Equals: (t) => Equal(t),
  NumberEquals: (t) => Equal(parseInt(t)),
  Contains: (t) => Like(`%${t}%`),
  PhoneNumber: (t) => Like(`%${t.replace(/-/g, '')}%`),
  UpperCase: (t) => Like(`%${t.toUpperCase()}%`),
  LowerCase: (t) => Like(`%${t.toLowerCase()}%`),
  KickboardCode: (t) => Equal(t.toUpperCase()),
};

export function generateWhere<T extends BaseEntity>(
  where: FindConditions<T>,
  search: string | undefined,
  target: { [key: string]: WhereTypeFunc },
): FindCondition<T>[] | FindCondition<T> {
  const newWhere: FindCondition<T>[] = [];
  let globalWhere: FindCondition<T> = {};
  if (!search) return where;
  if (!Array.isArray(where)) globalWhere = where;
  for (const [key, whereType] of Object.entries(target)) {
    const operator = whereType(search);
    if (!operator.value || _.get(globalWhere, key)) continue;
    const obj = _.set({ ...globalWhere }, key, operator);
    newWhere.push(obj);
  }

  return newWhere;
}
