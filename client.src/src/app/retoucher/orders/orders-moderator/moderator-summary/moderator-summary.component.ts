import { Component, OnInit, OnDestroy } from '@angular/core';
import { MdSnackBar, MdDialogConfig, MdDialogRef, MdDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { PageComponent } from '../../../../core/page/page.component';
import { fadeInAnimation } from '../../../../route.animation';
import { AuthorizationService } from '../../../../shared/authorization.sevice';
import { LoadingEvent, WorkStatus } from '../../../../core/enums';
import { Subscription } from 'rxjs/Subscription';
import { OrderModalActionsComponent } from '../../../../core/order-modal-actions/order-modal-actions.component';
import { DefaultConfigService } from '../../../../core/default-config.service';
import { OrderSummary } from '../../order-summary/order-summary';
import { OrdersService } from '../../orders.service';

@Component({
  selector: 'app-moderator-summary',
  templateUrl: './moderator-summary.component.html',
  styleUrls: ['./moderator-summary.component.scss'],
  animations: [fadeInAnimation],
})
export class ModeratorSummaryComponent extends PageComponent implements OnInit, OnDestroy {
  private orderSummarySubscription: Subscription;
  private orderId: string;
  private actionDialog: MdDialogRef<OrderModalActionsComponent>;
  private didAction = '';

  isLoading = false;
  isWeddingOrder = false;
  order: OrderSummary;
  isNew: boolean;
  isInProgress: boolean;
  isApproval: boolean;
  isFinished: boolean;
  isRemote = 0;
  comment = '';

  constructor(private router: Router,
              private route: ActivatedRoute,
              private ordersService: OrdersService,
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
      this.orderSummarySubscription = this.ordersService.getOrderSummary(this.orderId).subscribe((order) => {
        if (!order || !order.status) {
          this.router.navigate(['/orders']);
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

  onLoading($event: LoadingEvent) {
    this.isLoading = $event.isLoading;
    this.didAction = $event.didAction;
  }
}
