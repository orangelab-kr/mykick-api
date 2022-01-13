import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import _ from 'lodash';
import { FindCondition, FindOneOptions } from 'typeorm';
import { EntityFieldsNames } from 'typeorm/common/EntityFieldsNames';

export enum RequestOrderByType {
  asc = 'ASC',
  desc = 'DESC',
}

export class RequestOrderByDto<T, K extends keyof T> {
  @ApiPropertyOptional({ description: '정렬 기준' })
  @IsOptional()
  orderBy?: {
    [P in EntityFieldsNames<Pick<T, K>>]?: RequestOrderByType;
  };
}
