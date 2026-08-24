import { Injectable } from '@nestjs/common';
import { PDFParse, LoadParameters } from 'pdf-parse';
import { readFile } from 'node:fs/promises';
import { DateService } from 'src/utils/date/date.service';
import { ExpenseItemService } from 'src/expense-item/expense-item.service';
import { CreateExpenseItemDto } from 'src/expense-item/dto/create-expense-item.dto';

@Injectable()
export class LoadExpenseService {
  constructor(
    private readonly dateService: DateService,
    private readonly expenseItemService: ExpenseItemService,
  ) {}

  private handleDate(line: string): Date {
    const [day, monthStr] = line.substring(0, 6).split(' ');
    const date = this.dateService.formatToDate(
      Number(day),
      monthStr,
      new Date().getFullYear(),
    );
    return date;
  }

  private handleDescription(rawDescription: string, line: string): string {
    if (!rawDescription) rawDescription = line;
    return rawDescription.substring(17);
  }

  private handleValue(rawValue: string): string {
    return rawValue.replace('.', '').replace(',', '.').trim();
  }

  private handleNupay(line: string, company: string): string {
    if (line.includes(company) && !line.includes('Estorno')) {
      return line.replace(`${company} - NuPay`, `•••• 0000 ${company}`);
    }
    return line;
  }

  private async handleLine(line: string) {
    if (line.includes('••••')) {
      const date = this.handleDate(line);
      const [rawDescription, rawValue] = line.split('R$');
      const description = this.handleDescription(rawDescription, line);
      const value = rawValue ? this.handleValue(rawValue) : '000';
      console.log(
        `description:${description} value:${value} date:${String(date)}`,
      );
      const createExpenseItemDto = new CreateExpenseItemDto();
      createExpenseItemDto.description = description;
      createExpenseItemDto.value = value;
      createExpenseItemDto.date = date.toISOString().slice(0, 10);
      await this.expenseItemService.create(createExpenseItemDto);
    }
  }

  private async processLine(line: string) {
    line = this.handleNupay(line, 'Uber');
    line = this.handleNupay(line, 'iFood');
    await this.handleLine(line);
  }

  async loadExpense() {
    try {
      const buffer = await readFile('./files/fat.pdf');
      const loadParams: LoadParameters = { data: buffer };
      const parser = new PDFParse(loadParams);
      const result = await parser.getText();

      const lines = result.text.split('\n');

      for (const line of lines) {
        await this.processLine(String(line.trim()));
      }
    } catch (error: unknown) {
      console.error(error);
    }
  }
}
