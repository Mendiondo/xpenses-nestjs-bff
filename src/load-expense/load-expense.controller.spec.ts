import { Test, TestingModule } from '@nestjs/testing';
import { LoadExpenseController } from './load-expense.controller';
import { LoadExpenseService } from './load-expense.service';

describe('LoadExpenseController', () => {
  let controller: LoadExpenseController;
  let loadExpenseService: Pick<LoadExpenseService, 'loadExpense'>;

  beforeEach(async () => {
    loadExpenseService = {
      loadExpense: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoadExpenseController],
      providers: [
        {
          provide: LoadExpenseService,
          useValue: loadExpenseService,
        },
      ],
    }).compile();

    controller = module.get<LoadExpenseController>(LoadExpenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes the uploaded PDF buffer to the service', () => {
    const buffer = Buffer.from('%PDF-1.7');

    void controller.loadExpense({
      buffer,
      mimetype: 'application/pdf',
      size: buffer.length,
    });

    expect(loadExpenseService.loadExpense).toHaveBeenCalledWith(buffer);
  });
});
