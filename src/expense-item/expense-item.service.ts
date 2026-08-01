import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateExpenseItemDto } from './dto/create-expense-item.dto';
import { UpdateExpenseItemDto } from './dto/update-expense-item.dto';
import { Repository } from 'typeorm';
import { ExpenseItem } from './entities/expense-item.entity';

@Injectable()
export class ExpenseItemService {
  constructor(
    @InjectRepository(ExpenseItem)
    private readonly expenseItemRepository: Repository<ExpenseItem>,
  ) {}

  async create(createExpenseItemDto: CreateExpenseItemDto) {
    const expenseItem = this.expenseItemRepository.create(createExpenseItemDto);
    return await this.expenseItemRepository.save(expenseItem);
  }

  async findAll(): Promise<ExpenseItem[]> {
    return this.expenseItemRepository.find();
  }

  findOne(id: number) {
    return this.expenseItemRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, updateExpenseItemDto: UpdateExpenseItemDto) {
    const expenseItem = await this.findOne(id);
    if (!expenseItem) throw new NotFoundException();

    Object.assign(expenseItem, updateExpenseItemDto);

    return this.expenseItemRepository.save(expenseItem);
  }

  async remove(id: number) {
    const expenseItem = await this.findOne(id);
    if (!expenseItem) throw new NotFoundException();

    return await this.expenseItemRepository.remove(expenseItem);
  }
}
