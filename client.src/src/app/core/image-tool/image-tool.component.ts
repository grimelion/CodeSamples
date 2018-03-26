import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-image-tool',
  templateUrl: 'image-tool.component.html',
  styleUrls: ['image-tool.component.scss']
})

export class AppImageToolComponent implements OnInit {

  @Input()
  public photos: { url: string, filename: string }[];

  @Input()
  public isEditable = true;

  @Output()
  removed: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {  }

  removePhoto(photo) {
    this.removed.emit(photo);
  }
}
