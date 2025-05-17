import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decimalToTime',
  standalone: true
})
export class DecimalToTimePipe  implements PipeTransform {
  transform(value: number): string {
    if (isNaN(value) || value < 0) {
      return 'Invalid time';
    }

    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    if (minutes==0) {
      //return `${hours} h`;
    }
    return `${hours} h ${minutes} min`;
  }
}
