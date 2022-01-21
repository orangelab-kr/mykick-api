import { Test, TestingModule } from '@nestjs/testing';
import { InternalPricingController } from './internal-pricing.controller';

describe('InternalPricingController', () => {
  let controller: InternalPricingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternalPricingController],
    }).compile();

    controller = module.get<InternalPricingController>(InternalPricingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
