import 'express';
import { Addon } from '../src/addon/entities/addon.entity';
import { Session } from '../src/auth/session/entities/session.entity';
import { Card } from '../src/card/entities/card.entity';
import { InternalJwtDto } from '../src/internal/dto/internal-jwt.dto';
import { Payment } from '../src/payment/entities/payment.entity';
import { Pricing } from '../src/pricing/entities/pricing.entity';
import { Rent } from '../src/rent/entities/rent.entity';
import { User } from '../src/user/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user: User;
      pricing: Pricing;
      card: Card;
      addon: Addon;
      rent: Rent;
      addon: Addon;
      payment: Payment;
      internal: InternalJwtDto;
      loggined: {
        session: Session;
        user: User;
      };
    }
  }
}
