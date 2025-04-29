import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'node_modules/moment';

@Pipe({
  name: 'dateTimeFormat',
})
export class DateTimeFormatPipe implements PipeTransform {
  transform(value: any): any {
    if (!value) {
      return '';
    }

    return moment(value).format('MMM DD, YYYY hh:mm A');
  }
}
