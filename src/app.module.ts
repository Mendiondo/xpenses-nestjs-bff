/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ExpenseItemModule } from './expense-item/expense-item.module';
import { LoadExpenseModule } from './load-expense/load-expense.module';
import { DateService } from './utils/date/date.service';
import { ExpenseTypeModule } from './expense-type/expense-type.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') as string,
        port: Number(configService.get('DB_PORT')),
        username: configService.get('DB_USER_NAME') as string,
        password: configService.get('DB_PASSWORD') as string,
        database: configService.get('DB_DATABASE') as string,
        entities: [join(process.cwd(), 'dist/**/*.entity.js')],
        // do NOT use synchronize: true in real projects
        synchronize: true,
      }),
    }),
    ExpenseItemModule,
    LoadExpenseModule,
    ExpenseTypeModule,
  ],
  controllers: [AppController],
  providers: [AppService, DateService],
})
export class AppModule {}
