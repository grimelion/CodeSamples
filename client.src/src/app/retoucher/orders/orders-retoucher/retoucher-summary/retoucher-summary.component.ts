import { Component, OnInit, OnDestroy } from '@angular/core';
import { MdSnackBar, MdDialogConfig, MdDialogRef, MdDialog } from '@angular/material';
import { OrdersRetoucherService } from '../orders-retoucher.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PageComponent } from '../../../../core/page/page.component';
import { fadeInAnimation } from '../../../../route.animation';
import { RetoucherSummary } from './retoucher-summary';
import { AuthorizationService } from '../../../../shared/authorization.sevice';
import { LoadingEvent, WorkStatus } from '../../../../core/enums';
import { Subscription } from 'rxjs/Subscription';
import { OrderModalActionsComponent } from '../../../../core/order-modal-actions/order-modal-actions.component';
import { DefaultConfigService } from '../../../../core/default-config.service';

@Component({
  selector: 'app-retoucher-summary',
  templateUrl: './retoucher-summary.component.html',
  styleUrls: ['./retoucher-summary.component.scss'],
  animations: [fadeInAnimation],
})
export class RetoucherSummaryComponent extends PageComponent implements OnInit, OnDestroy {
  private orderSummarySubscription: Subscription;
  private orderId: string;
  private actionDialog: MdDialogRef<OrderModalActionsComponent>;
  private didAction = '';

  isLoading = false;
  isWeddingOrder = false;
  order: RetoucherSummary;
  isNew: boolean;
  isInProgress: boolean;
  isApproval: boolean;
  isFinished: boolean;
  isRemote = 0;
  comment = '';

  constructor(private router: Router,
              private route: ActivatedRoute,
              private ordersService: OrdersRetoucherService,
              protected snackBar: MdSnackBar,
              private auth: AuthorizationService,
              public dialog: MdDialog,
              private defaultConfigService: DefaultConfigService) {
    super();
  }

  ngOnInit() {
    this.isLoading = true;
    this.route.params.subscribe((params) => {
      this.orderId = params['orderId'];
      this.orderSummarySubscription = this.ordersService.getTodoSummary(this.orderId).subscribe((order) => {
        if (!order || !order.status) {
          this.router.navigate(['/orders-retoucher']);
        }
        if (this.didAction) {
          this.snackBar.open(this.didAction, 'Close', this.defaultConfigService.mdSnackBarConfig);
          this.didAction = '';
        }
        this.isWeddingOrder = order.type === 'wedding';
        this.isNew = order.status === WorkStatus.New;
        this.isInProgress = order.status === WorkStatus.InProgress;
        this.isApproval = order.status === WorkStatus.Approval;
        this.isFinished = order.status === WorkStatus.Finished;
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

  acceptOrder() {
    this.ordersService.acceptOrder(this.orderId);
    this.isLoading = true;
    this.didAction = 'Accepted';
  }

  dissociateRetoucher() {
    this.ordersService.dissociateRetoucher(this.orderId);
    this.isLoading = true;
  }

  onLoading($event: LoadingEvent) {
    this.isLoading = $event.isLoading;
    this.didAction = $event.didAction;
  }
}
