import { Pipe, PipeTransform } from '@angular/core';
import {prettyLabel} from '../utils/helper';

@Pipe({
  name: 'prettyLabel',
  standalone: true
})
export class PrettyLabelPipe implements PipeTransform {
  transform(value: string): string {
    return prettyLabel(value);
/*    if (!value) return '';
    return value
      .toLowerCase()              // convert to lowercase
      .split('_')                 // split on underscores
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize each word
      .join(' ');                 // join with space*/
  }
}
