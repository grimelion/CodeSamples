
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { fadeInAnimation } from '../../../../route.animation';
import { ClientOrder } from '../../client-order';
import { PageComponent } from '../../../../core/page/page.component';
import { OrdersService } from '../../orders.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.scss'],
  animations: [fadeInAnimation],
})
export class NewOrderComponent extends PageComponent implements OnInit {

  orderType = '';
  isWeddingOrder = false;
  isRetouchingOrder = false;

  clientOrder$: Observable<ClientOrder>;

  constructor(private route: ActivatedRoute, private ordersService: OrdersService) {
    super();
  }

  ngOnInit() {
    this.clientOrder$ = this.ordersService.clientOrder$;
    this.route.params.subscribe((params) => {
      this.ordersService.setClientOrder(new ClientOrder(params['orderType']));
      this.orderType = params['orderType'];
      this.isWeddingOrder = params['orderType'] === 'wedding';
      this.isRetouchingOrder = !this.isWeddingOrder;
    });
  }
}
