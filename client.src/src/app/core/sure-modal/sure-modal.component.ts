import { Component } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-sure-modal',
  templateUrl: 'sure-modal.component.html',
  styleUrls: ['sure-modal.component.scss']
})
export class SureModalComponent {

  public title = 'Are you sure?';

  constructor(public dialogRef: MdDialogRef<SureModalComponent>) { }
}
