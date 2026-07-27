import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExpenseItemModule } from './expense-item/expense-item.module';

@Module({
  imports: [ExpenseItemModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
