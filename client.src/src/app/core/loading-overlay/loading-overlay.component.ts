/* tslint:disable:component-selector */
import { Component, OnInit, OnChanges, Input } from '@angular/core';

@Component({
  selector: 'ms-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.scss']
})
export class LoadingOverlayComponent implements OnInit, OnChanges {

  @Input('isLoading') isLoading: boolean;

  @Input('fixed') fixed: boolean;

  @Input() progress: Number;

  @Input() mode = 'determinate';

  constructor() { }

  ngOnChanges(changes): void {
    this.progress ? this.mode = 'determinate' : this.mode = 'indeterminate';
  }

  ngOnInit() { }

}
