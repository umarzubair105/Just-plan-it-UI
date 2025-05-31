import {Inject, Pipe, PipeTransform} from '@angular/core';
//import { DatePipe } from '@angular/common';

@Pipe({
  name: 'formatDate',
  standalone: true
})
export class FormatDatePipe implements PipeTransform {
  //datePipe: DatePipe
  //constructor(private datePipe: DatePipe) {}
  transform(date: Date | null, format: string = 'yyyy-MM-dd HH:mm:ss'): string {
    if (!date) {
      return '-'; // or return ''; to show nothing
    }
    //return this.datePipe.transform(date, format) ?? '-';
    return date.toISOString().split('T')[0];
    //constructor(private datePipe: DatePipe) {}

    //formattedDate = this.datePipe.transform('2025-05-31T18:34:54.332344', 'yyyy-MM-dd HH:mm:ss');
  }
}
