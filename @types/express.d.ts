import 'express';
import { Addon } from '../src/addon/entities/addon.entity';
import { Pricing } from '../src/pricing/entities/pricing.entity';
import { User } from '../src/user/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user: User;
      pricing: Pricing;
      addon: Addon;
    }
  }
}
