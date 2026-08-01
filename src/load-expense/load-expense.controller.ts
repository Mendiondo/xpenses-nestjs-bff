import { Controller, Get } from '@nestjs/common';
import { LoadExpenseService } from './load-expense.service';

@Controller('load-expense')
export class LoadExpenseController {
  constructor(private readonly loadExpenseService: LoadExpenseService) {}

  @Get()
  loadExpense() {
    return this.loadExpenseService.loadExpense();
  }
}
