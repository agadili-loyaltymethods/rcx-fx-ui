import { formatDate, formatNumber } from '@angular/common';
import { Injectable } from '@angular/core';
import * as moment from 'node_modules/moment';
import { DateTimeFormatPipe } from '../pipes/date-time-format.pipe';
@Injectable({
  providedIn: 'root',
})
export class DynamicPipeService {
  pipes = {
    date: formatDate,
    number: (value, locale, digitInfo) => {
      return formatNumber(value, locale, digitInfo);
    },
    utcDate: (value) => moment(new Date(value)).format('MMM D, YYYY h:mm A'),
    dateOnly: (value) => moment(value).format('yyyy-MM-DD'),
    dateTimeFormat: (value) => new DateTimeFormatPipe().transform(value),
    longDateTimeFormat: (value) => moment(value).format('LLL'),
    radix: (value) => {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      });

      return formatter.format(value);
    },
    duration: (value) => {
      let result = '';

      if (value >= 3600) {
        const hours = Math.floor(value / 3600);

        result = hours + 'h ';
        value %= 3600;
      }
      if (value >= 60) {
        const minutes = Math.floor(value / 60);

        result += minutes + 'm ';
        value %= 60;
      }
      if (value) {
        result += Math.floor(value) + 's';
      }

      return result.trim();
    },
  };
}
