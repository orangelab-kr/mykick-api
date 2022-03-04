import { Test, TestingModule } from '@nestjs/testing';
import { InternalAddonController } from './internal-addon.controller';

describe('InternalAddonController', () => {
  let controller: InternalAddonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternalAddonController],
    }).compile();

    controller = module.get<InternalAddonController>(InternalAddonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
