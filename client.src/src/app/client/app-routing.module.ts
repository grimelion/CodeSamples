import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PreferencesComponent } from '../core/preferences/preferences.component';
import { ProfileComponent } from './profile/profile/profile.component';
import { OrdersComponent } from './orders/orders.component';
import { LoginComponent } from './login/login/login.component';
import { RegisterComponent } from './login/register/register.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { PageNotFoundComponent } from '../core/page-not-found/page-not-found.component';
import { LoggedInGuard } from './logged-in.guard';
import { NewOrderComponent } from './orders/order-type/new-order/new-order.component';
import { OrderSummaryComponent } from './orders/order-summary/order-summary.component';
import { SidenavService } from '../core/sidenav/sidenav.service';
import { CreateOrderComponent } from './orders/order-type/new-order/create-order/create-order.component';
import { AddFilesComponent } from './orders/order-type/new-order/add-files/add-files.component';
import { CheckoutComponent } from './orders/order-type/new-order/checkout/checkout.component';
import { CheckoutGuard } from './orders/order-type/new-order/checkout.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoggedInGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [LoggedInGuard],
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [LoggedInGuard],
  },
  {
    path: '',
    component: AdminComponent,
    canActivate: [LoggedInGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'orders',
        component: OrdersComponent,
      },
      {
        path: 'orders/:orderType/new',
        component: NewOrderComponent,
        children: [
          {
            path: '',
            component: CreateOrderComponent,
          },
          {
            path: 'files',
            component: AddFilesComponent,
            canActivate: [CheckoutGuard],
          },
          {
            path: 'checkout',
            component: CheckoutComponent,
          }
        ]
      },
      {
        path: 'orders/summary/:orderId',
        component: OrderSummaryComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'preferences',
        component: PreferencesComponent
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: '**',
        component: PageNotFoundComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class RoutingModule {
  constructor(sidenavService: SidenavService) {
    sidenavService.addItem('Dashboard', 'home', '/dashboard', 1);
    sidenavService.addItem('Orders', 'bars', '/orders', 1, null, null, false, 'orders-menu-item');
    sidenavService.addItem('Photographer\'s profile', 'camera', '/profile', 1, null, null, false, 'profile-menu-item');
    sidenavService.addItem('Preferences', 'cog', '/preferences', 1);
    sidenavService.addItem('Support', 'question-circle',
      'https://simpleProject.com/faq?utm_source=client-cabinet&utm_medium=cabinet-links&utm_campaign=howto-link',
      1, null, null, true);
  }
}
