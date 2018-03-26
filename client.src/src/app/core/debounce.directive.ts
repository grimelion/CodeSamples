/* tslint:disable:directive-selector */
import { Directive, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

@Directive({
  selector: '[ngModel][debounce]',
})
export class DebounceDirective implements OnInit {
  @Output()
  public onDebounce = new EventEmitter<any>();

  @Input('debounce')
  public debounce = 500;

  private isFirstChange = true;

  constructor(public model: NgControl) {
  }

  ngOnInit() {
    this.model.valueChanges
      .debounceTime(this.debounce)
      .distinctUntilChanged()
      .subscribe(modelValue => {
        if (this.isFirstChange) {
          this.isFirstChange = false;
        } else {
          this.onDebounce.emit(modelValue);
        }
      });
  }
}
