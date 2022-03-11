import { Test, TestingModule } from '@nestjs/testing';
import { InternalProviderController } from './internal-provider.controller';

describe('InternalProviderController', () => {
  let controller: InternalProviderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternalProviderController],
    }).compile();

    controller = module.get<InternalProviderController>(
      InternalProviderController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
