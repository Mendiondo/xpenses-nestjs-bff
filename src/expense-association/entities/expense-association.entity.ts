import { ExpenseType } from 'src/expense-type/entities/expense-type.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'expense_association' })
export class ExpenseAssociation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  item: string;

  @Column({ name: 'expenseTypeId' })
  expenseTypeId: number;

  @ManyToOne(() => ExpenseType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expenseTypeId' })
  expenseType: ExpenseType;
}
