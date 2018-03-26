import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageComponent } from '../../core/page/page.component';
import { Subscription } from 'rxjs/Subscription';
import { ColumnHeader, SortEvent } from '../../core/sortable-table/sortable-table.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MailTemplatesService } from './mail-templates.service';
import { fadeInAnimation } from '../../route.animation';

@Component({
  selector: 'app-mail-templates',
  templateUrl: './mail-templates.component.html',
  styleUrls: ['./mail-templates.component.scss'],
  animations: [fadeInAnimation]
})
export class MailTemplatesComponent extends PageComponent implements OnInit, OnDestroy {
  isLoading = false;

  sortByColumn = 'addedAt';
  sortOrder = 'desc';

  ordersSubscription: Subscription;

  columns = <ColumnHeader[]>[
    {name: 'id', value: '#', sortable: false, enabled: true, alwaysShown: true, width: 150},
    {name: 'Provider', value: 'provider', sortable: true, enabled: true, alwaysShown: true, width: 100},
    {name: 'Subject', value: 'subject', sortable: true, enabled: true, alwaysShown: true, width: 150},
    {name: 'From', value: 'from', sortable: true, enabled: true, alwaysShown: true, width: 150},
    {name: 'Enabled', value: 'enabled', sortable: true, enabled: true, alwaysShown: true, width: 100},
    {name: '', value: 'button', sortable: false, enabled: true, alwaysShown: true, width: 100},
  ];

  templates = [];

  constructor(private route: ActivatedRoute, private router: Router, private mailTemplatesService: MailTemplatesService) {
    super();
  }

  ngOnInit() {
    this.isLoading = true;
    this.ordersSubscription = this.mailTemplatesService.getMailTemplates(this.sortByColumn, this.sortOrder).subscribe(data => {
      this.templates = data;
      this.isLoading = false;
    });
  }

  private refresh() {
    this.mailTemplatesService.getMailTemplates(this.sortByColumn, this.sortOrder).subscribe(data => {
      this.templates = data;
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
