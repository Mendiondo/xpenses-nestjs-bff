import { ExpenseItem } from 'src/expense-item/entities/expense-item.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'expense_type' })
export class ExpenseType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @OneToMany(() => ExpenseItem, (expenseItem) => expenseItem.expenseType)
  expenseItem: ExpenseItem[];
}
