import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageComponent } from '../../../core/page/page.component';
import { fadeInAnimation } from '../../../route.animation';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ColumnHeader, SortEvent } from '../../../core/sortable-table/sortable-table.component';
import { OrdersService } from '../orders.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-orders',
  templateUrl: './orders-moderator.component.html',
  styleUrls: ['./orders-moderator.component.scss'],
  animations: [fadeInAnimation],
})
export class OrdersComponent extends PageComponent implements OnInit, OnDestroy {

  isLoading = false;

  sortByColumn = 'addedAt';
  sortOrder = 'desc';

  ordersSubscription: Subscription;

  columns = <ColumnHeader[]>[
    {name: '#', value: '#', sortable: false, enabled: true, alwaysShown: false, width: 75},
    {name: 'Name', value: 'name', sortable: true, enabled: true, alwaysShown: false, width: 150},
    {name: 'Client', value: 'displayName', sortable: true, enabled: true, alwaysShown: false, width: 200},
    {name: 'Status', value: 'status', sortable: true, enabled: true, alwaysShown: false, width: 140},
    {name: 'Samples', value: 'sampleStatus', sortable: true, enabled: true, alwaysShown: false, width: 165},
    {name: 'Type', value: 'type', sortable: true, enabled: true, alwaysShown: false, width: 175},
    {name: 'Images', value: 'numberOfImages', sortable: true, enabled: true, alwaysShown: false, width: 200},
    {name: 'Added', value: 'addedAt', sortable: true, enabled: true, alwaysShown: false, width: 200},
    {name: 'Deadline at', value: 'deadlineAt', sortable: true, enabled: true, alwaysShown: false, width: 200},
    {name: 'Retoucher', value: 'retoucher', sortable: true, enabled: true, alwaysShown: false, width: 200}
  ];

  orders = [];

  constructor(protected route: ActivatedRoute, protected router: Router, protected ordersService: OrdersService) {
    super();
  }

  ngOnInit() {
    this.refresh();
  }

  protected refresh() {
    this.ordersSubscription = this.ordersService.getOrders(this.sortByColumn, this.sortOrder).subscribe(data => {
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
