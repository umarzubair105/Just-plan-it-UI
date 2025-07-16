import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateNumber',
  standalone: true
})
export class TruncateNumberPipe implements PipeTransform {
  transform(value: number): number {
    return Math.trunc(value); // Removes decimal part
  }
}
