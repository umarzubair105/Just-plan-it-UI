import { Pipe, PipeTransform } from '@angular/core';
import {transformToDhM} from '../utils/helper';

@Pipe({
  name: 'decimalToTime',
  standalone: true
})
export class DecimalToTimePipe  implements PipeTransform {
  transform(totalMinutes: number): string {
    return transformToDhM(totalMinutes);
  }
}
