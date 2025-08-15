import { Pipe, PipeTransform } from '@angular/core';
import {transformToDhM} from '../utils/helper';

@Pipe({ name: 'minutesToHours',
  standalone: true})
export class MinutesToHoursPipe implements PipeTransform {
  transform(value: number): string {
    return transformToDhM(value);
  }
}
