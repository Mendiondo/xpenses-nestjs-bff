import { IsString, IsDateString } from 'class-validator';

export class CreateExpenseItemDto {
  @IsString()
  name: string;

  @IsDateString()
  date: string;
}
