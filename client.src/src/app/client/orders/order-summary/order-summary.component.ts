import { Component, OnInit, OnDestroy } from '@angular/core';
import { MdSnackBar, MdDialogRef, MdDialogConfig, MdDialog } from '@angular/material';
import { OrdersService } from '../orders.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PageComponent } from '../../../core/page/page.component';
import { fadeInAnimation } from '../../../route.animation';
import { OrderSummary } from '../order-summary';
import { AuthorizationService } from '../../../shared/authorization.sevice';
import { OrderStatus, transformCurrency } from '../../../core/enums';
import { Subscription } from 'rxjs/Subscription';
import { OrderModalActionsComponent } from '../../../core/order-modal-actions/order-modal-actions.component';
import { DefaultConfigService } from '../../../core/default-config.service';


@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss'],
  animations: [fadeInAnimation],
})
export class OrderSummaryComponent extends PageComponent implements OnInit, OnDestroy {
  private orderSummarySubscription: Subscription;
  private orderId: string;
  private actionDialog: MdDialogRef<OrderModalActionsComponent>;

  isLoading = false;
  didAction = '';
  isWeddingOrder = false;
  order: OrderSummary;
  isPending: boolean;
  isApproval: boolean;
  isReady: boolean;
  isInvalidPayment: boolean;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private ordersService: OrdersService,
              protected snackBar: MdSnackBar,
              private defaultConfigService: DefaultConfigService,
              private auth: AuthorizationService,
              public dialog: MdDialog) {
    super();
  }

  ngOnInit() {
    this.isLoading = true;
    this.route.params.take(1).subscribe((params) => {
      this.orderId = params['orderId'];
      this.orderSummarySubscription = this.ordersService.getOrderSummary(this.orderId).subscribe((order) => {
        if (!order.id) {
          this.router.navigate(['orders']);
        }
        if (this.didAction) {
          this.snackBar.open(this.didAction, 'Close', this.defaultConfigService.mdSnackBarConfig);
          this.didAction = '';
        }
        this.isWeddingOrder = order.type === 'wedding';
        this.isPending = order.status === OrderStatus.Pending;
        this.isApproval = order.status === OrderStatus.Approval;
        this.isReady = order.status === OrderStatus.Ready;
        this.isInvalidPayment = order.status === OrderStatus.InvalidPayment;
        this.order = order;
        this.isLoading = false;
      });
    });
  }

  ngOnDestroy() {
    if (this.orderSummarySubscription) {
      this.orderSummarySubscription.unsubscribe();
    }
  }

  openDialog(isApproved: boolean) {
    this.actionDialog = this.dialog.open(OrderModalActionsComponent,
      <MdDialogConfig>{
      data: {
        title: isApproved ? 'Approve order' : 'Additional corrections',
        description: 'Please, leave your comment below',
      }
    });
    this.actionDialog.afterClosed().toPromise().then((result) => {
      if (result) {
        result.orderId = this.orderId;
        result.isApproved = isApproved;
        this.ordersService.orderSummaryAction(result);
        this.isLoading = true;
        this.didAction = isApproved ? 'Success!' : 'Additional corrections sent!';
      }
    });
  }
}
