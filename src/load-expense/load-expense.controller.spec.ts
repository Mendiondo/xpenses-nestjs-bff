import { Test, TestingModule } from '@nestjs/testing';
import { LoadExpenseController } from './load-expense.controller';
import { LoadExpenseService } from './load-expense.service';

describe('LoadExpenseController', () => {
  let controller: LoadExpenseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoadExpenseController],
      providers: [LoadExpenseService],
    }).compile();

    controller = module.get<LoadExpenseController>(LoadExpenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
