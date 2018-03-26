import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageComponent } from '../../core/page/page.component';
import { fadeInAnimation } from '../../route.animation';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ColumnHeader, SortEvent } from '../../core/sortable-table/sortable-table.component';
import { ClientsService } from './clients.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  animations: [fadeInAnimation]
})
export class ClientsComponent extends PageComponent implements OnInit, OnDestroy {

  isLoading = false;

  sortByColumn = 'addedAt';
  sortOrder = 'desc';

  ordersSubscription: Subscription;

  columns = <ColumnHeader[]>[
    {name: 'Display Name', value: 'displayName', sortable: true, enabled: true, alwaysShown: false, width: 200},
    {name: 'Email', value: 'email', sortable: true, enabled: true, alwaysShown: false, width: 200},
  ];

  clients = [];

  constructor(private route: ActivatedRoute, private router: Router, private clientsService: ClientsService) {
    super();
  }

  ngOnInit() {
    this.isLoading = true;
    this.ordersSubscription = this.clientsService.getClients(this.sortByColumn, this.sortOrder).subscribe(data => {
      this.clients = data;
      this.isLoading = false;
    });
  }

  private refresh() {
    this.clientsService.getClients(this.sortByColumn, this.sortOrder).subscribe(data => {
      this.clients = data;
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
