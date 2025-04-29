import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trimText',
})
export class TextTrimPipe implements PipeTransform {
  transform(value: string, limit?: number): string {
    if (!value) {
      return '';
    }
    const actualLimit = limit ? limit : 15;

    return value.length > 17 ? value.substring(0, actualLimit) + '...' : value;
  }
}
