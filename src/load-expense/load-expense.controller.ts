import {
  Controller,
  FileTypeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoadExpenseService } from './load-expense.service';

interface UploadedPdfFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

@Controller('load-expense')
export class LoadExpenseController {
  constructor(private readonly loadExpenseService: LoadExpenseService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  loadExpense(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'application/pdf' })],
      }),
    )
    file: UploadedPdfFile,
  ) {
    return this.loadExpenseService.loadExpense(file.buffer);
  }
}
