import { Component, OnInit, OnDestroy } from '@angular/core';
import { fadeInAnimation } from '../../../route.animation';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from '../orders.service';
import { OrdersComponent } from './orders-moderator.component';

@Component({
  selector: 'app-moderator-orders-brief',
  templateUrl: './orders-moderator-brief.component.html',
  styleUrls: ['./orders-moderator.component.scss'],
  animations: [fadeInAnimation],
})
export class OrdersModeratorBriefComponent extends OrdersComponent implements OnInit, OnDestroy {

  private moderatorId = '';

  constructor(protected route: ActivatedRoute, protected router: Router, protected ordersService: OrdersService) {
    super(route, router, ordersService);
  }

  ngOnInit() {
    this.isLoading = true;
    this.route.params.subscribe((params) => {
      this.moderatorId = params['moderatorId'];
      this.refresh();
    });
  }

  protected refresh() {
    this.ordersSubscription = this.ordersService.getModeratorOrdersBrief(this.sortByColumn, this.sortOrder, this.moderatorId)
      .subscribe(data => {
        this.orders = data;
        this.isLoading = false;
      });
  }
}
