import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageComponent } from '../../core/page/page.component';
import { fadeInAnimation } from '../../route.animation';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ColumnHeader, SortEvent } from '../../core/sortable-table/sortable-table.component';
import { OrdersService } from './orders.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  animations: [fadeInAnimation],
})
export class OrdersComponent extends PageComponent implements OnInit, OnDestroy {

  public isLoading = false;

  public sortByColumn = 'addedAt';
  public sortOrder = 'desc';

  ordersSubscription: Subscription;

  columns = <ColumnHeader[]>[
    {name: 'Name', value: 'name', sortable: false, enabled: true, alwaysShown: true, width: 150},
    {name: 'Images', value: 'numberOfImages', sortable: false, enabled: true, alwaysShown: true, width: 82},
    {name: 'Type', value: 'todo', sortable: false, enabled: true, alwaysShown: false, width: 125},
    {name: 'Added', value: 'addedAt', sortable: false, enabled: true, alwaysShown: false, width: 200},
    {name: 'Status', value: 'status', sortable: false, enabled: true, alwaysShown: false, width: 140}
  ];

  public orders = [];
  public isPending = false;

  constructor(private route: ActivatedRoute, private router: Router, private ordersService: OrdersService) {
    super();
  }

  ngOnInit() {
    this.isLoading = true;
    this.ordersSubscription = this.ordersService.getOrders(this.sortByColumn, this.sortOrder).subscribe(data => {
      this.orders = data;
      this.isLoading = false;
    });
  }

  private refresh() {
    this.ordersService.getOrders(this.sortByColumn, this.sortOrder).subscribe(data => {
      this.orders = data;
      this.isLoading = false;
    });
  }

  doRemoveOrder($event, id: string) {
    this.isLoading = true;
    $event.preventDefault();
    $event.stopPropagation();
    this.ordersService.orderRemove(id);
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
