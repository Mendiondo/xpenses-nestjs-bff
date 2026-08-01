import { Module } from '@nestjs/common';
import { LoadExpenseService } from './load-expense.service';
import { LoadExpenseController } from './load-expense.controller';
import { DateService } from 'src/utils/date/date.service';
import { ExpenseItemModule } from 'src/expense-item/expense-item.module';

@Module({
  imports: [ExpenseItemModule],
  controllers: [LoadExpenseController],
  providers: [LoadExpenseService, DateService],
})
export class LoadExpenseModule {}
