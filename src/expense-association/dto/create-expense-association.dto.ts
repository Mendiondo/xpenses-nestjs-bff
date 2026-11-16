import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateExpenseAssociationDto {
  @IsString()
  @IsNotEmpty()
  item: string;

  @IsInt()
  expenseTypeId: number;
}
