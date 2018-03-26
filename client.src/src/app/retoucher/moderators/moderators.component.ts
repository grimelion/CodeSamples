import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageComponent } from '../../core/page/page.component';
import { fadeInAnimation } from '../../route.animation';
import { ActivatedRoute, Router } from '@angular/router';
import { ColumnHeader, SortEvent } from '../../core/sortable-table/sortable-table.component';
import { Subscription } from 'rxjs/Subscription';
import { RetouchersService } from '../retouchers/retouchers.service';

@Component({
  selector: 'app-moderators',
  templateUrl: './moderators.component.html',
  styleUrls: ['./moderators.component.scss'],
  animations: [fadeInAnimation]
})
export class ModeratorsComponent extends PageComponent implements OnInit, OnDestroy {

  isLoading = false;

  sortByColumn = 'addedAt';
  sortOrder = 'desc';

  retouchersSubscription: Subscription;
  columns = <ColumnHeader[]>[
    {name: 'Display Name', value: 'displayName', sortable: true, enabled: true, alwaysShown: false, width: 200},
    {name: 'Email', value: 'email', sortable: true, enabled: true, alwaysShown: false, width: 200},
    {name: 'Card', value: 'card', sortable: true, enabled: true, alwaysShown: false, width: 200},
    {name: 'Phone', value: 'phone', sortable: true, enabled: true, alwaysShown: false, width: 200},
    {name: 'Skype', value: 'skype', sortable: true, enabled: true, alwaysShown: false, width: 200},
  ];

  moderators = [];

  constructor(private route: ActivatedRoute, private router: Router, private retouchersService: RetouchersService) {
    super();
  }

  ngOnInit() {
    this.isLoading = true;
    this.refresh();
  }

  private refresh() {
    this.retouchersSubscription = this.retouchersService.getModerators(this.sortByColumn, this.sortOrder).subscribe(data => {
      this.moderators = data;
      this.isLoading = false;
    });
  }

  public onOrderSort(event: SortEvent) {
    this.sortByColumn = event.columnName;
    this.sortOrder = event.sortOrder;
    this.refresh();
  }

  ngOnDestroy() {
    this.retouchersSubscription.unsubscribe();
  }
}
