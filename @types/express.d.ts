import 'express';
import { Pricing } from '../src/pricing/entities/pricing.entity';

declare global {
  namespace Express {
    interface Request {
      pricing: Pricing;
    }
  }
}
