import { Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
  formatToDate(day: number, monthStr: string, year: number): Date {
    const months = [
      'jan',
      'fev',
      'mar',
      'abr',
      'mai',
      'jun',
      'jul',
      'ago',
      'set',
      'out',
      'nov',
      'dez',
    ];
    const monthIndex = months.indexOf(monthStr.toLowerCase());
    return new Date(year, monthIndex, day);
  }
}
