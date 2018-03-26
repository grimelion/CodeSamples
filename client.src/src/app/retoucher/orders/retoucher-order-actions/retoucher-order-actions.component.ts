import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { MdDialogConfig, MdDialogRef, MdDialog } from '@angular/material';
import { OrderModalActionsComponent } from '../../../core/order-modal-actions/order-modal-actions.component';
import { LoadingEvent, SampleStatus, WorkStatus } from '../../../core/enums';
import { RetoucherSummary } from 'app/retoucher/orders/orders-retoucher/retoucher-summary/retoucher-summary';
import { OrdersRetoucherService } from '../orders-retoucher/orders-retoucher.service';

@Component({
  selector: 'app-retoucher-order-actions',
  templateUrl: './retoucher-order-actions.component.html',
  styleUrls: ['./retoucher-order-actions.component.scss']
})
export class RetoucherOrderActionsComponent implements OnInit {

  @Input()
  set todo(order: RetoucherSummary) {
    this.order = order;
    this.orderForm.patchValue({
      retoucherLink: order.retoucherLink
    });
    this.samplesForm.patchValue({
      retoucherLink: order.retoucherSamplesLink
    });
    if (!(order.sampleStatus === SampleStatus.InProgress || order.sampleStatus === SampleStatus.AdditionalCorrections)) {
      this.samplesForm.disable();
    }
    if (!(order.status === WorkStatus.InProgress || order.status === WorkStatus.Failure)) {
      this.orderForm.disable();
    }
    this.isNoComments = !(
      order.retoucherComment
      || order.retoucherSamplesComment
      || order.moderatorCorrections
      || order.moderatorSamplesCorrections);
  };

  @Output('onLoading')
  onLoading: EventEmitter<LoadingEvent> = new EventEmitter<LoadingEvent>();

  order: RetoucherSummary;
  isLoading = false;
  isNoComments = false;
  samplesForm: FormGroup;
  orderForm: FormGroup;
  actionDialog: MdDialogRef<OrderModalActionsComponent>;

  constructor(private ordersToDoService: OrdersRetoucherService,
              private formBuilder: FormBuilder,
              public dialog: MdDialog) {
    this.samplesForm = this.formBuilder.group({
      retoucherLink: ['', [Validators.required, CustomValidators.url]]
    });
    this.orderForm = this.formBuilder.group({
      retoucherLink: ['', [Validators.required, CustomValidators.url]]
    });
  }

  ngOnInit() {
  }
  private sendOrder(work, isApproved) {
    if (!work.valid) {
      return;
    }
    const formModel = work.value;
    this.actionDialog = this.dialog.open(OrderModalActionsComponent,
      <MdDialogConfig>{
        data: {
          title: isApproved ? 'Send order' : 'Send samples',
          description: 'Please, leave your comment below'
        }
      });
    this.actionDialog.afterClosed().toPromise().then((result) => {
      if (result) {
        this.ordersToDoService.sendOrder({orderId: this.order.id, comment: result.comment, retoucherLink: formModel.retoucherLink});
        this.onLoading.emit(new LoadingEvent(true, isApproved ? 'Order sent' : 'Samples sent'));
      }
    });
  }
}
