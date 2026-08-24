import { ExpenseType } from 'src/expense-type/entities/expense-type.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'expense_item' })
export class ExpenseItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  description: string;

  // yyyy-MM-dd
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ name: 'expenseTypeId', nullable: true })
  expenseTypeId: number;

  @ManyToOne(() => ExpenseType, (expenseType) => expenseType.expenseItem, {
    eager: true,
  })
  @JoinColumn({ name: 'expenseTypeId' })
  expenseType: ExpenseType;
}
