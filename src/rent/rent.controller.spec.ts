import { Test, TestingModule } from '@nestjs/testing';
import { RentController } from './rent.controller';
import { RentService } from './rent.service';

describe('RentController', () => {
  let controller: RentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentController],
      providers: [RentService],
    }).compile();

    controller = module.get<RentController>(RentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
