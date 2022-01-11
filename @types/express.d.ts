import 'express';
import { Addon } from '../src/addon/entities/addon.entity';
import { Pricing } from '../src/pricing/entities/pricing.entity';

declare global {
  namespace Express {
    interface Request {
      pricing: Pricing;
      addon: Addon;
    }
  }
}
