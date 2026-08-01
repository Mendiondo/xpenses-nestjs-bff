import { Test, TestingModule } from '@nestjs/testing';
import { LoadExpenseService } from './load-expense.service';

describe('LoadExpenseService', () => {
  let service: LoadExpenseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoadExpenseService],
    }).compile();

    service = module.get<LoadExpenseService>(LoadExpenseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
