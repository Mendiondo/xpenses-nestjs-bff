import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseTypeDto } from './dto/create-expense-type.dto';
import { UpdateExpenseTypeDto } from './dto/update-expense-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseItem } from 'src/expense-item/entities/expense-item.entity';
import { Repository } from 'typeorm';
import { ExpenseType } from './entities/expense-type.entity';

@Injectable()
export class ExpenseTypeService {
  constructor(
    @InjectRepository(ExpenseItem)
    private readonly expenseTypeRepository: Repository<ExpenseType>,
  ) {}

  async create(createExpenseTypeDto: CreateExpenseTypeDto) {
    const expenseType = this.expenseTypeRepository.create(createExpenseTypeDto);
    return await this.expenseTypeRepository.save(expenseType);
  }

  findAll() {
    return this.expenseTypeRepository.find();
  }

  findOne(id: number) {
    return this.expenseTypeRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, updateExpenseTypeDto: UpdateExpenseTypeDto) {
    const expenseType = await this.findOne(id);
    if (!expenseType) throw new NotFoundException();

    Object.assign(expenseType, updateExpenseTypeDto);

    return this.expenseTypeRepository.save(expenseType);
  }

  async remove(id: number) {
    const expenseType = await this.findOne(id);
    if (!expenseType) throw new NotFoundException();

    return await this.expenseTypeRepository.remove(expenseType);
  }
}
