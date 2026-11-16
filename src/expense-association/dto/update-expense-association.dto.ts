import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseAssociationDto } from './create-expense-association.dto';

export class UpdateExpenseAssociationDto extends PartialType(CreateExpenseAssociationDto) {}
