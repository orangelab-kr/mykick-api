import { IntersectionType, PickType } from '@nestjs/swagger';
import { Rent } from '../../rent/entities/rent.entity';
import { Payment } from '../entities/payment.entity';

export class PurchasePaymentWithItemsDto extends IntersectionType(
  class extends PickType(Payment, ['name', 'items'] as const) {},
  class extends PickType(Rent, ['rentId'] as const) {},
) {}
