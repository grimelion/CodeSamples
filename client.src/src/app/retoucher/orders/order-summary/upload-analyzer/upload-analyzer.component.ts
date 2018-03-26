import { Component, Input, OnInit } from '@angular/core';
import { OrderSummary } from '../order-summary';

@Component({
  selector: 'app-upload-analyzer',
  templateUrl: './upload-analyzer.component.html',
  styleUrls: ['./upload-analyzer.component.scss']
})
export class UploadAnalyzerComponent implements OnInit {

  isAdvanced = false;
  @Input()
  order: OrderSummary;

  constructor() { }

  ngOnInit() {
  }

  advancedToggle() {
    this.isAdvanced = !this.isAdvanced;
  }

}
