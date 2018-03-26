import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrdersRetoucherService } from './orders-retoucher.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ColumnHeader, SortEvent } from '../../../core/sortable-table/sortable-table.component';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from '../orders.service';
import { PageComponent } from '../../../core/page/page.component';
import { fadeInAnimation } from '../../../route.animation';
import { OrdersRetoucherComponent } from './orders-retoucher.component';

@Component({
  selector: 'app-orders-retoucher-brief',
  templateUrl: './orders-retoucher-brief.component.html',
  styleUrls: ['./orders-retoucher.component.scss'],
  animations: [fadeInAnimation],
})
export class OrdersRetoucherBriefComponent extends OrdersRetoucherComponent implements OnInit, OnDestroy {

  private retoucherId = '';

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected toDoService: OrdersRetoucherService,
    protected ordersService: OrdersService) {
    super(route, router, toDoService);
  }

  ngOnInit() {
    this.isLoading = true;
    this.route.params.subscribe((params) => {
      this.retoucherId = params['retoucherId'];
      this.refresh();
    });
  }

  protected refresh() {
    this.ordersSubscription = this.ordersService.getRetoucherOrdersBrief(this.sortByColumn, this.sortOrder, this.retoucherId)
      .subscribe(data => {
        this.orders = data;
        this.isLoading = false;
      });
  }
}
