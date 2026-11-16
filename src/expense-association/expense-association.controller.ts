import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExpenseAssociationService } from './expense-association.service';
import { CreateExpenseAssociationDto } from './dto/create-expense-association.dto';
import { UpdateExpenseAssociationDto } from './dto/update-expense-association.dto';

@Controller('expense-association')
export class ExpenseAssociationController {
  constructor(
    private readonly expenseAssociationService: ExpenseAssociationService,
  ) {}

  @Post()
  create(@Body() createExpenseAssociationDto: CreateExpenseAssociationDto) {
    return this.expenseAssociationService.create(createExpenseAssociationDto);
  }

  @Get()
  findAll() {
    return this.expenseAssociationService.findAll();
  }

  @Get('generate-associations')
  generate_associations() {
    return this.expenseAssociationService.generate_associations();
  }

  @Get('analyze')
  analyze() {
    return this.expenseAssociationService.analyze();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expenseAssociationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseAssociationDto: UpdateExpenseAssociationDto,
  ) {
    return this.expenseAssociationService.update(
      +id,
      updateExpenseAssociationDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expenseAssociationService.remove(+id);
  }
}
