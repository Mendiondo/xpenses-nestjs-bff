import { Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
  formatToDate(day: number, monthStr: string, year: number): Date {
    const months = [
      'jan',
      'feb',
      'mar',
      'apr',
      'may',
      'jun',
      'jul',
      'aug',
      'sep',
      'oct',
      'nov',
      'dec',
    ];
    const monthIndex = months.indexOf(monthStr.toLowerCase()) + 1;
    return new Date(year, monthIndex, day);
  }
}
