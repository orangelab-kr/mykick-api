import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { Rent } from '../../rent/entities/rent.entity';
import { Payment } from '../entities/payment.entity';

export class PurchasePaymentWithAmountDto extends IntersectionType(
  class extends PickType(Payment, ['name', 'amount'] as const) {},
  class extends IntersectionType(
    class extends PartialType(PickType(Payment, ['items'] as const)) {},
    class extends PickType(Rent, ['rentId'] as const) {},
  ) {},
) {}
