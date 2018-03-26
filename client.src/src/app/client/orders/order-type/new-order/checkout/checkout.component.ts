import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Http } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { OrdersService } from '../../../orders.service';
import { FormBuilder } from '@angular/forms';
import { MdSnackBar } from '@angular/material';
import { DefaultConfigService } from '../../../../../core/default-config.service';
import { DropboxService } from '../../../../../core/dropbox/dropbox.service';
import 'rxjs/add/operator/catch';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { ClientOrder } from '../../../client-order';
import { WindowRef } from '../../../../../shared/window-ref';
import { OrderStatus } from '../../../../../core/enums';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {

  public isLoading = true;
  public orderKey = '';

  public recentOrderSubscription: Subscription;
  public recentOrder: ClientOrder;
  public price: number;
  public isWeddingOrder = false;
  public isRetouchingOrder = false;

  public clientOrder$: Observable<ClientOrder>;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private ordersService: OrdersService) { }

  ngOnInit() {

    this.recentOrderSubscription = this.ordersService.getOrders().subscribe((orders) => {
      if (orders.length) {
        const order = orders[orders.length - 1];
        this.isLoading = true;
        if (order.status === OrderStatus.Pending) {
          this.recentOrder = order;
          this.isWeddingOrder = this.recentOrder.type === 'wedding';
          this.isRetouchingOrder = !this.isWeddingOrder;
          this.orderKey = this.recentOrder.id;
          this.price = this.recentOrder.price || 0;
          this.isLoading = false;
        } else if (this.recentOrder && order.status === OrderStatus.InProgress ) {
          this.router.navigate(['orders']);
        }
      }
    });
  }

  ngOnDestroy() {
    this.recentOrderSubscription.unsubscribe();
  }
}
