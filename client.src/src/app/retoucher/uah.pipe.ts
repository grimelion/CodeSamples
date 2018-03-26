import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uah'
})
export class UahPipe implements PipeTransform {

  transform(value: number, args?: any): any {
    return (value / 100).toFixed(2) + '₴';
  }

}
