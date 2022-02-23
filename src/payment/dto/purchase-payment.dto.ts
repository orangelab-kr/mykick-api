import { PickType } from '@nestjs/swagger';
import { Payment } from '../entities/payment.entity';

export class PurchasePaymentDto extends PickType(Payment, [
  'name',
  'items',
  'rent',
] as const) {}
