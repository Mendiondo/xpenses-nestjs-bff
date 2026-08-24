import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateExpenseItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsInt()
  expenseTypeId: number;
}
