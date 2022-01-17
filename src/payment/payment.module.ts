import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardModule } from '../card/card.module';
import { Payment } from './entities/payment.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), forwardRef(() => CardModule)],
  exports: [TypeOrmModule.forFeature([Payment]), PaymentService],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
