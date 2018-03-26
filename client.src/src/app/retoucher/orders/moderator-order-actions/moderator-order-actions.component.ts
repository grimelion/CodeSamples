import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderSummary } from '../order-summary/order-summary';
import { OrdersService } from '../orders.service';
import { MdDialog, MdDialogConfig, MdDialogRef } from '@angular/material';
import { SureModalComponent } from '../../../core/sure-modal/sure-modal.component';
import { OrderModalActionsComponent } from '../../../core/order-modal-actions/order-modal-actions.component';
import { LoadingEvent, SampleStatus, WorkStatus } from '../../../core/enums';
@Component({
  selector: 'app-moderator-order-actions',
  templateUrl: './moderator-order-actions.component.html',
  styleUrls: ['./moderator-order-actions.component.scss']
})
export class ModeratorOrderActionsComponent implements OnInit {

  private sureDialog: MdDialogRef<SureModalComponent>;
  private actionDialog: MdDialogRef<OrderModalActionsComponent>;
  @Input()
  set summary(order: OrderSummary) {
    this.isNotFinished = order.status !== WorkStatus.Finished;
    this.additionalModeratorSamplesLink = order.additionalModeratorSamplesLink;
    this.additionalModeratorOrderLink = order.additionalModeratorOrderLink;
    this.notCheckingOrder = !(order.status === WorkStatus.Checking || order.status === WorkStatus.Failure);
    this.notChecking = !(order.sampleStatus === SampleStatus.Checking || order.sampleStatus === SampleStatus.AdditionalCorrections);
    this.order = order;
  };

  @Output('onLoading')
  onLoading: EventEmitter<LoadingEvent> = new EventEmitter<LoadingEvent>();

  order: OrderSummary;
  isLoading = false;
  isNotFinished = false;
  additionalModeratorSamplesLink = '';
  additionalModeratorOrderLink = '';
  notChecking = false;
  notCheckingOrder = false;

  constructor(private ordersService: OrdersService,
              private dialog: MdDialog) { }

  ngOnInit() { }

  orderSummaryAction(isApproved) {
    this.actionDialog = this.dialog.open(OrderModalActionsComponent,
      <MdDialogConfig>{
        data: {
          title: isApproved ? 'Approve order' : 'Additional corrections',
          description: 'Please, leave your comment below'
        }
      });
    this.actionDialog.afterClosed().toPromise().then((result) => {
      if (result) {
        result.orderId = this.order.id;
        result.isApproved = isApproved;
        result.additionalModeratorSamplesLink = this.additionalModeratorSamplesLink || '';
        result.additionalModeratorOrderLink = this.additionalModeratorOrderLink || '';
        this.ordersService.orderSummaryAction(result);
        this.onLoading.emit(new LoadingEvent(true, isApproved ? 'Sent to client!' : 'Sent to retoucher!'));
      }
    });
  }

  approveOrder() {
    this.orderSummaryAction(true);
  }

  approveSamples() {
    this.orderSummaryAction(true);
  }

  additionalCorrections() {
    this.orderSummaryAction(false);
  }

}
