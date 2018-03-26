import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrdersRetoucherService } from './orders-retoucher.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ColumnHeader, SortEvent } from '../../../core/sortable-table/sortable-table.component';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from '../orders.service';
import { PageComponent } from '../../../core/page/page.component';
import { fadeInAnimation } from '../../../route.animation';

@Component({
  selector: 'app-orders-retoucher',
  templateUrl: './orders-retoucher.component.html',
  styleUrls: ['./orders-retoucher.component.scss'],
  animations: [fadeInAnimation],
})
export class OrdersRetoucherComponent extends PageComponent implements OnInit, OnDestroy {

  isLoading = false;

  sortByColumn = 'addedAt';
  sortOrder = 'desc';

  ordersSubscription: Subscription;

  columns = <ColumnHeader[]>[
    {name: 'Name',     value: 'name',                sortable: false, enabled: true, alwaysShown: true,    width: 100},
    {name: 'Status',   value: 'status',              sortable: false, enabled: true, alwaysShown: false,   width: 140},
    {name: 'Samples',  value: 'sampleStatus',        sortable: false, enabled: true, alwaysShown: false,   width: 140},
    {name: 'Images',   value: 'images',              sortable: false, enabled: true, alwaysShown: true,    width: 70},
    {name: 'Type',     value: 'type',                sortable: false, enabled: true, alwaysShown: false,   width: 125},
    {name: 'Deadline', value: 'retoucherDeadlineAt', sortable: false, enabled: true, alwaysShown: false,   width: 200},
  ];

  orders = [];

  constructor(protected route: ActivatedRoute, protected router: Router, protected toDoService: OrdersRetoucherService) {
    super();
  }

  ngOnInit() {
    this.isLoading = true;
    this.refresh();
  }

  protected refresh() {
    this.ordersSubscription = this.toDoService.getTodos(this.sortByColumn, this.sortOrder).subscribe(data => {
      this.orders = data;
      this.isLoading = false;
    });
  }

  public onOrderSort(event: SortEvent) {
    this.sortByColumn = event.columnName;
    this.sortOrder = event.sortOrder;
    this.refresh();
  }

  ngOnDestroy() {
    this.ordersSubscription.unsubscribe();
  }
}
