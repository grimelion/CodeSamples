import { Pipe, PipeTransform } from '@angular/core';
import { WindowRef } from '../shared/window-ref';
import { DomSanitizer } from '@angular/platform-browser';
import { DefaultConfigService } from './default-config.service';

@Pipe({
  name: 'translate'
})
export class TranslatePipe implements PipeTransform {

  constructor(private defaultConfigService: DefaultConfigService) {}

  transform(value: string, args?: any): any {
    return this.defaultConfigService.translations[value];
  }

}
