import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MD_DIALOG_DATA, MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-order-modal-actions',
  templateUrl: 'order-modal-actions.component.html',
  styleUrls: ['order-modal-actions.component.scss']
})
export class OrderModalActionsComponent implements OnInit, OnDestroy {

  public title: string;
  public description: string;
  public isAccepted = false;
  public comment: string;
  public folderCheckLink: string;

  constructor(public dialogRef: MdDialogRef<OrderModalActionsComponent>,
              @Inject(MD_DIALOG_DATA) private data: any) {
    this.title = data.title || 'Leave a comment';
    this.description = data.description || '';
    this.comment = data.comment || '';
    this.folderCheckLink = data.folderCheckLink || '';
  }

  ngOnInit() {
  }

  public saveChoice(isAccepted: boolean) {
    if (isAccepted) {
      this.dialogRef.close({comment: this.comment});
    } else {
      this.dialogRef.close(isAccepted);
    }
  }

  ngOnDestroy() { }

}
