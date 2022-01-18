import { Test, TestingModule } from '@nestjs/testing';
import { InternalRentController } from './internal-rent.controller';

describe('InternalRentController', () => {
  let controller: InternalRentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternalRentController],
    }).compile();

    controller = module.get<InternalRentController>(InternalRentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
