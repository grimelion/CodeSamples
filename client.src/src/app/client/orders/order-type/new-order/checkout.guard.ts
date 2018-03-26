import { Injectable } from '@angular/core';
import { Router, CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { OrdersService } from '../../orders.service';

@Injectable()
export class CheckoutGuard implements CanActivate {

  constructor(private ordersService: OrdersService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.ordersService.clientOrder$.map(clientOrder => {
      if (clientOrder.upload && (clientOrder.upload.copying
        || clientOrder.upload.linking || clientOrder.upload.sharing || clientOrder.upload.uploading)) {
        this.router.navigateByUrl('/orders');
        return false;
      } else {
        return true;
      }
    });
  }
}
