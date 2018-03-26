import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderSummary } from '../order-summary/order-summary';
import { OrdersService } from '../orders.service';
import { MdDialog, MdDialogConfig, MdDialogRef } from '@angular/material';
import { SureModalComponent } from '../../../core/sure-modal/sure-modal.component';
import { OrderModalActionsComponent } from '../../../core/order-modal-actions/order-modal-actions.component';
import { LoadingEvent, WorkStatus } from '../../../core/enums';

@Component({
  selector: 'app-admin-order-actions',
  templateUrl: './admin-order-actions.component.html',
  styleUrls: ['./admin-order-actions.component.scss']
})
export class AdminOrderActionsComponent implements OnInit {

  private sureDialog: MdDialogRef<SureModalComponent>;
  @Input()
  set summary(order: OrderSummary) {
    this.isNotFinished = order.status !== WorkStatus.Finished;
    this.order = order;
  };

  @Output('onLoading')
  onLoading: EventEmitter<LoadingEvent> = new EventEmitter<LoadingEvent>();

  order: OrderSummary;
  isLoading = false;
  isNotFinished = false;

  constructor(private ordersService: OrdersService,
              private dialog: MdDialog) { }

  ngOnInit() { }

  orderSummaryAction() {
    this.sureDialog = this.dialog.open(SureModalComponent);
    this.sureDialog.afterClosed().toPromise().then((result) => {
      if (result) {
        this.ordersService.adminSendToClient({
          orderId: this.order.id
        });
        this.onLoading.emit(new LoadingEvent(true, 'Sent to client!'));
      }
    });
  }

  approveOrder() {
    this.orderSummaryAction();
  }

  approveSamples() {
    this.orderSummaryAction();
  }

}
