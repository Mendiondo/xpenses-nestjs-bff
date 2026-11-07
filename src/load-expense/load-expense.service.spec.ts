import { Test, TestingModule } from '@nestjs/testing';
import { LoadExpenseService } from './load-expense.service';
import { DateService } from 'src/utils/date/date.service';
import { ExpenseItemService } from 'src/expense-item/expense-item.service';

describe('LoadExpenseService', () => {
  let service: LoadExpenseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadExpenseService,
        { provide: DateService, useValue: {} },
        { provide: ExpenseItemService, useValue: {} },
      ],
    }).compile();

    service = module.get<LoadExpenseService>(LoadExpenseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
