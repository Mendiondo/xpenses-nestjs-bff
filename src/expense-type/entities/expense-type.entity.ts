import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'expense_type' })
export class ExpenseType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;
}
