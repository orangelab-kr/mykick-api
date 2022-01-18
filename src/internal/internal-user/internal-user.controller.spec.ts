import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../user/user.service';
import { InternalUserController } from './internal-user.controller';

describe('InternalUserController', () => {
  let controller: InternalUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternalUserController],
      providers: [UserService],
    }).compile();

    controller = module.get<InternalUserController>(InternalUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
