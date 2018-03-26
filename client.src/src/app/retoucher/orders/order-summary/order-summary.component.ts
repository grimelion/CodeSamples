import { Component, OnInit, OnDestroy } from '@angular/core';
import { MdSnackBar, MdDialogConfig, MdDialog, MdDialogRef } from '@angular/material';
import { OrdersService } from '../orders.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ActivatedRoute, Router } from '@angular/router';
import { PageComponent } from '../../../core/page/page.component';
import { fadeInAnimation } from '../../../route.animation';
import { OrderSummary } from './order-summary';
import { LoadingEvent, WorkStatus } from '../../../core/enums';
import { Subscription } from 'rxjs/Subscription';
import { OrderModalActionsComponent } from '../../../core/order-modal-actions/order-modal-actions.component';
import { SureModalComponent } from '../../../core/sure-modal/sure-modal.component';
import * as _ from 'lodash';
import { DefaultConfigService } from '../../../core/default-config.service';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss'],
  animations: [fadeInAnimation],
})
export class OrderSummaryComponent extends PageComponent implements OnInit, OnDestroy {
  private orderSummarySubscription: Subscription;
  private orderSummaryDataSubscription: Subscription;
  private orderId: string;
  private retouchersSubscription: Subscription;
  private moderatorsSubscription: Subscription;
  private adminsSubscription: Subscription;
  private actionDialog: MdDialogRef<OrderModalActionsComponent>;
  private sureDialog: MdDialogRef<SureModalComponent>;

  public assignGroup: FormGroup;

  isAdmin = false;
  isSuper = false;
  isWeddingOrder = false;
  isPending: boolean;
  isNew: boolean;
  isInProgress: boolean;
  isApproval: boolean;
  isFailure: boolean;
  isFinished: boolean;
  isLoading = false;
  isEditable = false;
  isSentToRetoucher = false;
  isReady = false;
  didAction = '';
  cantSkipSampleApproval = false;
  order: OrderSummary;
  retouchers = [];
  moderators = [];
  admins = [];
  comment = '';
  deadlineAt: Date;
  retoucherDeadlineAt: Date;
  retoucherPrice: number;
  moderatorPrice: number;
  isModerator: boolean;
  adminId: string;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private ordersService: OrdersService,
              protected snackBar: MdSnackBar,
              public dialog: MdDialog,
              private defaultConfigService: DefaultConfigService,
              private formBuilder: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.isLoading = true;
    this.isModerator = this.route.snapshot.data['isModerator'];

    this.route.data.subscribe(routeData => {
      this.isAdmin = routeData['isAdmin'];
      this.isSuper = routeData['isSuper'];
    });
    this.route.params.subscribe((params) => {
      this.orderId = params['orderId'];
      if (this.isSuper) {
        this.orderSummarySubscription = this.ordersService.getSuperSummary(this.orderId).subscribe(order => this.handleOrder(order));
      } else if (this.isAdmin) {
        this.orderSummarySubscription = this.ordersService.getAdminSummary(this.orderId).subscribe(order => this.handleOrder(order));
      } else {
        this.orderSummarySubscription = this.ordersService.getOrderSummary(this.orderId).subscribe(order => this.handleOrder(order));
      }
      this.assignGroup = this.formBuilder.group({
        isRemote: [1],
        moderatorLink: ['', [<any>Validators.required, <any>CustomValidators.url]],
        assignedRetoucherId: [''],
        assignedModeratorId: [''],
        moderatorComment: ['']
      });
      if (this.isAdmin) {
        this.retouchersSubscription = this.ordersService.getRetouchers().subscribe((retouchers) => {
          this.retouchers = retouchers;
        });
        this.moderatorsSubscription = this.ordersService.getModerators().subscribe((moderators) => {
          console.log(moderators);
          this.moderators = moderators;
        });
      }
      if (this.isSuper) {
        this.adminsSubscription = this.ordersService.getAdmins().subscribe((admins) => {
          this.admins = admins;
        });
      }
    });
  }

  public handleOrder(order) {
      if (!order.id) {
        this.router.navigate(['orders-moderator']);
      }
      if (this.didAction) {
        this.snackBar.open(this.didAction, 'Close', this.defaultConfigService.mdSnackBarConfig);
        this.didAction = '';
      }
      this.orderSummaryDataSubscription = this.ordersService.getClientData(order.userId).subscribe(result => {
        const parsedData = _.extend.apply(null, result);
        this.comment = order.moderatorComment;
        if (parsedData.assignedRetoucher) {
          this.assignGroup.controls['assignedRetoucherId'].patchValue(parsedData.assignedRetoucher.id);
        }
        if (parsedData.assignedModeratorId) {
          this.assignGroup.controls['assignedModeratorId'].patchValue(parsedData.assignedModeratorId);
        }
      });

      this.assignGroup.patchValue(order);
      if (!order.moderatorLink) {
        this.assignGroup.get('moderatorLink').patchValue(order.progressLink);
      }
      this.isWeddingOrder = order.type === 'wedding';
      this.isPending = order.status === WorkStatus.Pending;
      this.isNew = order.status === WorkStatus.New;
      this.isInProgress = order.status === WorkStatus.InProgress;
      this.isApproval = order.status === WorkStatus.Approval;
      this.isFailure = order.status === WorkStatus.Failure;
      this.isReady = order.status === WorkStatus.Ready;
      this.isFinished = order.status === WorkStatus.Finished;
      this.isSentToRetoucher = order.status === WorkStatus.Assigned;
      this.isEditable = !(this.isFinished || this.isNew || this.isPending);
      this.cantSkipSampleApproval = order.isApproved || !order.wantToApprove;
      this.retoucherPrice = order.retoucherPrice / 100;
      this.moderatorPrice = order.moderatorPrice / 100;
      this.deadlineAt = new Date(order.deadlineAt);
      this.retoucherDeadlineAt = new Date(order.retoucherDeadlineAt);
      this.order = order;
      this.adminId = order.assignedAdminId;
      this.isLoading = false;
      console.log(this.isReady);
  };

  public assignOrder() {
    if (!this.assignGroup.valid) {
      return;
    }
    const data  = this.assignGroup.value;
    this.isLoading = true;
    const retoucher = this.retouchers.reduce((prev, currentVal, currentIndex) => {
        return currentVal['$key'] === data.assignedRetoucherId ? currentVal : prev;
    });
    const moderator = this.moderators.reduce((prev, currentVal, currentIndex) => {
      return currentVal['$key'] === data.assignedModeratorId ? currentVal : prev;
    });
    this.ordersService.assignOrder(
      this.orderId,
      data.moderatorComment,
      retoucher.$key,
      retoucher.displayName || retoucher.email,
      moderator.$key,
      moderator.displayName || moderator.email,
      data.isRemote,
      data.moderatorLink || '');
    this.didAction = 'assigned!';
  }

  openApproveDialog(isApproved: boolean) {
    this.actionDialog = this.dialog.open(OrderModalActionsComponent,
      <MdDialogConfig>{
      data: {
        title: isApproved ? 'Approve order' : 'Additional corrections',
        description: 'Please, leave your comment below'
      }
    });
    this.actionDialog.afterClosed().toPromise().then((result) => {
      if (result) {
        result.orderId = this.orderId;
        result.isApproved = isApproved;
        this.ordersService.orderSummaryAction(result);
      }
    });
  }

  dissociateRetoucher() {
    this.sureDialog = this.dialog.open(SureModalComponent, new MdDialogConfig());
    this.sureDialog.afterClosed().toPromise().then((result) => {
      if (result) {
        this.isLoading = true;
        this.ordersService.dissociateRetoucher(this.orderId);
        this.didAction = 'reassign success!';
      }
    });
  }

  skipSampleApproval() {
    this.sureDialog = this.dialog.open(SureModalComponent, new MdDialogConfig());
    this.sureDialog.afterClosed().toPromise().then((result) => {
      if (result) {
        this.isLoading = true;
        this.ordersService.skipSampleApproval(this.orderId);
        this.didAction = 'skipped!';
      }
    });
  }

  removeFiles() {
    this.sureDialog = this.dialog.open(SureModalComponent, new MdDialogConfig());
    this.sureDialog.afterClosed().toPromise().then((result) => {
      if (result) {
        this.isLoading = true;
        this.ordersService.removeFiles(this.orderId);
        this.didAction = 'removed!';
      }
    });
  }

  removeOrder() {
    this.sureDialog = this.dialog.open(SureModalComponent, new MdDialogConfig());
    this.sureDialog.afterClosed().toPromise().then((result) => {
      if (result) {
        this.isLoading = true;
        this.ordersService.removeOrder(this.orderId).then(() => this.router.navigate(['orders-moderator']));
        this.didAction = 'removed!';
      }
    });
  }

  approvePayment() {
    this.sureDialog = this.dialog.open(SureModalComponent, new MdDialogConfig());
    this.sureDialog.afterClosed().toPromise().then((result) => {
      if (result) {
        this.isLoading = true;
        this.ordersService.approvePayment(this.orderId);
        this.didAction = 'approved!';
      }
    });
  }

  updateDatesAndPrice() {
    if (!this.isSuper) {
      return this.updateDates();
    }
    Promise.all([
      this.ordersService.updateDates({
        orderId: this.orderId,
        retoucherDeadlineAt: this.retoucherDeadlineAt.getTime(),
        deadlineAt: this.deadlineAt.getTime()
      }),
      this.ordersService.updatePrice({
        orderId: this.orderId,
        retoucherPrice: this.retoucherPrice,
        moderatorPrice: this.moderatorPrice,
      })
    ]).then(() => this.snackBar.open(`Updated!`, 'Close', this.defaultConfigService.mdSnackBarConfig));
  }

  updateDates() {
    this.ordersService.updateDates({
      orderId: this.orderId,
      retoucherDeadlineAt: this.retoucherDeadlineAt.getTime(),
      deadlineAt: this.deadlineAt.getTime()
    }).then(() => this.snackBar.open(`Updated!`, 'Close', this.defaultConfigService.mdSnackBarConfig));
  }

  assignAdmin() {
    this.ordersService.assignAdmin(this.adminId, this.order.id)
      .then(() => this.snackBar.open(`Assigned!`, 'Close', this.defaultConfigService.mdSnackBarConfig));
  }

  onLoading($event: LoadingEvent) {
    this.isLoading = $event.isLoading;
    this.didAction = $event.didAction;
  }

  ngOnDestroy() {
    if (this.orderSummarySubscription) {
      this.orderSummarySubscription.unsubscribe();
    }
    if (this.retouchersSubscription) {
      this.retouchersSubscription.unsubscribe();
      this.moderatorsSubscription.unsubscribe();
    }
    if (this.adminsSubscription) {
      this.adminsSubscription.unsubscribe();
    }
    this.orderSummaryDataSubscription.unsubscribe();
  }
}
