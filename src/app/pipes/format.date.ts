import {Inject, Pipe, PipeTransform} from '@angular/core';
//import { DatePipe } from '@angular/common';

@Pipe({
  name: 'formatDate',
  standalone: true
})
export class FormatDatePipe implements PipeTransform {
  //datePipe: DatePipe
  //constructor(private datePipe: DatePipe) {}
  transform(value: any): string {
    if (!value) return '';

    const date = new Date(value);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

    //return this.datePipe.transform(date, format) ?? '-';
    //return date.toISOString().split('T')[0];
    //constructor(private datePipe: DatePipe) {}

    //formattedDate = this.datePipe.transform('2025-05-31T18:34:54.332344', 'yyyy-MM-dd HH:mm:ss');
  }
}
