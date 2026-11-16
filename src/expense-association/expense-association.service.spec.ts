import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseAssociationService } from './expense-association.service';

describe('ExpenseAssociationService', () => {
  let service: ExpenseAssociationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpenseAssociationService],
    }).compile();

    service = module.get<ExpenseAssociationService>(ExpenseAssociationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
