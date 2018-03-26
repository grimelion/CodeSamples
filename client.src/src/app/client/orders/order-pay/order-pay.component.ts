import { Component, Input, OnInit } from '@angular/core';
import { OrderSummary } from '../order-summary';
import { environment } from '../../../../environments/environment';
import { OrdersService } from '../orders.service';
import { OrderStatus } from '../../../core/enums';

@Component({
  selector: 'app-order-pay',
  templateUrl: './order-pay.component.html',
  styleUrls: ['./order-pay.component.scss']
})
export class OrderPayComponent implements OnInit {

  isLoading = false;
  toCheckoutId = environment.toCheckoutId;
  toCheckoutUrl = environment.toCheckoutUrl;

  @Input('order') set order(order: OrderSummary) {
    if (order && order.price && order.status === OrderStatus.Pending) {
      this.orderService.logOrder(order, 'PrePayment');
    }
    this.orderSummary = order;
  }
  public orderSummary: OrderSummary;

  constructor(private orderService: OrdersService) { }

  ngOnInit() {
  }

  doTrial() {
    this.isLoading = true;
    this.orderService.checkoutTrial(this.orderSummary.id);
  }
}
