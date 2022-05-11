import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import _ from 'lodash';
import { Addon } from '../../addon/entities/addon.entity';
import { Phone } from '../../auth/phone/entities/phone.entity';
import { Session } from '../../auth/session/entities/session.entity';
import { Token } from '../../auth/token/entities/token.entity';
import { Card } from '../../card/entities/card.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { Pricing } from '../../pricing/entities/pricing.entity';
import { Provider } from '../../provider/entities/provider.entity';
import { Rent } from '../../rent/entities/rent.entity';
import { User } from '../../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: _.get(process.env, 'DB_HOST', 'localhost'),
      port: _.parseInt(_.get(process.env, 'DB_HOST', '3306')),
      username: _.get(process.env, 'DB_USERNAME', 'root'),
      password: _.get(process.env, 'DB_PASSWORD'),
      database: _.get(process.env, 'DB_DATABASE', 'mykick'),
      entities: [
        Addon,
        Phone,
        Session,
        Token,
        Card,
        Payment,
        Pricing,
        Rent,
        User,
        Provider,
      ],
      keepConnectionAlive: true,
      synchronize: false,
    }),
  ],
})
export class DatabaseModule {}
