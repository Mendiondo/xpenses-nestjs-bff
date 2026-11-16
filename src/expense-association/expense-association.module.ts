import { Module } from '@nestjs/common';
import { ExpenseAssociationService } from './expense-association.service';
import { ExpenseAssociationController } from './expense-association.controller';
import { ExpenseAssociation } from './entities/expense-association.entity';
import { ExpenseItem } from 'src/expense-item/entities/expense-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseAssociation, ExpenseItem])],
  controllers: [ExpenseAssociationController],
  providers: [ExpenseAssociationService],
})
export class ExpenseAssociationModule {}
