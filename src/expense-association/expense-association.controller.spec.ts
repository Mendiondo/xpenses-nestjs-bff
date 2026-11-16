import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseAssociationController } from './expense-association.controller';
import { ExpenseAssociationService } from './expense-association.service';

describe('ExpenseAssociationController', () => {
  let controller: ExpenseAssociationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseAssociationController],
      providers: [ExpenseAssociationService],
    }).compile();

    controller = module.get<ExpenseAssociationController>(ExpenseAssociationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
