import 'express';
import { Addon } from '../src/addon/entities/addon.entity';
import { Card } from '../src/card/entities/card.entity';
import { Pricing } from '../src/pricing/entities/pricing.entity';
import { User } from '../src/user/entities/user.entity';
import { Session } from '../src/auth/session/entities/session.entity';

declare global {
  namespace Express {
    interface Request {
      user: User;
      pricing: Pricing;
      card: Card;
      addon: Addon;
      loggined: {
        session: Session;
        user: User;
      };
    }
  }
}
