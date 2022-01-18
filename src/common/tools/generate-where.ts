import _ from 'lodash';
import {
  BaseEntity,
  FindCondition,
  FindConditions,
  FindOperator,
  Like,
} from 'typeorm';

export type WhereTypeFunc = (t: string) => FindOperator<any>;
export const WhereType: { [key: string]: WhereTypeFunc } = {
  Normal: (t) => Like(`%${t}%`),
  PhoneNumber: (t) => Like(`%${t.replace(/-/, '')}%`),
  UpperCase: (t) => Like(`%${t.toUpperCase()}%`),
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
    if (_.get(globalWhere, key)) continue;
    const obj = _.set({ ...globalWhere }, key, whereType(search));
    newWhere.push(obj);
  }

  return newWhere;
}
