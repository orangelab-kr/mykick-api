import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import _ from 'lodash';
import { Addon } from '../addon/entities/addon.entity';
import { Phone } from '../auth/phone/entities/phone.entity';
import { Pricing } from '../pricing/entities/pricing.entity';
import { User } from '../user/entities/user.entity';
import { Session } from '../user/session/entities/session.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: _.get(process.env, 'DB_HOST', 'localhost'),
      port: _.parseInt(_.get(process.env, 'DB_HOST', '3306')),
      username: _.get(process.env, 'DB_USERNAME', 'root'),
      password: _.get(process.env, 'DB_PASSWORD'),
      database: _.get(process.env, 'DB_DATABASE', 'mykick'),
      entities: [Pricing, Addon, User, Phone, Session],
      keepConnectionAlive: true,
      synchronize: false,
    }),
  ],
})
export class DatabaseModule {}
