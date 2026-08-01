import { IsNotEmpty, IsString } from 'class-validator';

export class CreateExpenseTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
