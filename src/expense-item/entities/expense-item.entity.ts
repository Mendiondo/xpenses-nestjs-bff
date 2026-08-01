import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'expense_item' })
export class ExpenseItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  description: string;

  // yyyy-MM-dd
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'integer' })
  value: number;
}
