import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AdminComponent} from './admin/admin.component';
import { PageNotFoundComponent } from '../core/page-not-found/page-not-found.component';
import { LoggedInGuard } from './logged-in.guard';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from '../retoucher/profile/profile.component';
import { OrdersComponent } from './orders/orders-moderator/orders-moderator.component';
import { OrderSummaryComponent } from './orders/order-summary/order-summary.component';
import { ClientProfileComponent } from './orders/order-summary/client-profile/client-profile.component';
import { ClientsComponent } from './clients/clients.component';
import { MailTemplatesComponent } from './mail-templates/mail-templates.component';
import { MailTemplateComponent } from './mail-templates/mail-template/mail-template.component';
import { RetouchersComponent } from './retouchers/retouchers.component';
import { OrdersRetoucherComponent } from './orders/orders-retoucher/orders-retoucher.component';
import { RetoucherSummaryComponent } from './orders/orders-retoucher/retoucher-summary/retoucher-summary.component';
import { OrdersAdminComponent } from './orders/orders-admin/orders-admin.component';
import { ModeratorSummaryComponent } from './orders/orders-moderator/moderator-summary/moderator-summary.component';
import { ModeratorsComponent } from './moderators/moderators.component';
import { OrdersModeratorBriefComponent } from './orders/orders-moderator/orders-moderator-brief.component';
import { OrdersRetoucherBriefComponent } from './orders/orders-retoucher/orders-retoucher-brief.component';


const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoggedInGuard],
  },
  {
    path: '',
    component: AdminComponent,
    canActivate: [LoggedInGuard],
    children: [
      {
        path: '',
        redirectTo: '/profile',
        pathMatch: 'full'
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'orders-moderator',
        component: OrdersComponent
      },
      {
        path: 'clients',
        component: ClientsComponent
      },
      {
        path: 'retouchers',
        component: RetouchersComponent
      },
      {
        path: 'moderators',
        component: ModeratorsComponent
      },
      {
        path: 'retouchers/:retoucherId',
        component: OrdersRetoucherBriefComponent
      },
      {
        path: 'moderators/:moderatorId',
        component: OrdersModeratorBriefComponent
      },
      {
        path: 'mail-templates',
        component: MailTemplatesComponent
      },
      {
        path: 'mail-templates/:id',
        component: MailTemplateComponent
      },
      {
        path: 'clients/:clientId',
        component: ClientProfileComponent,
        data: {isModerator : true, isSuper: true}
      },
      {
        path: 'orders-super',
        component: OrdersAdminComponent,
        data: {isAdmin : true, isSuper: true}
      },
      {
        path: 'orders-admin',
        component: OrdersAdminComponent,
        data: {isAdmin : true, isSuper: false}
      },
      {
        path: 'orders-retoucher',
        component: OrdersRetoucherComponent
      },
      {
        path: 'orders-moderator/summary/:orderId',
        component: ModeratorSummaryComponent
      },
      {
        path: 'orders-retoucher/summary/:orderId',
        component: RetoucherSummaryComponent
      },
      {
        path: 'orders-admin/summary/:orderId',
        component: OrderSummaryComponent,
        data: {isAdmin : true}
      },
      {
        path: 'orders-super/summary/:orderId',
        component: OrderSummaryComponent,
        data: {isAdmin : true, isSuper: true}
      },
      {
        path: 'orders-admin/summary/:orderId/client/:clientId',
        component: ClientProfileComponent,
        data: {isAdmin: true}
      },
      {
        path: 'orders-super/summary/:orderId/client/:clientId',
        component: ClientProfileComponent,
        data: {isAdmin: true,  isSuper: true}
      },
      {
        path: 'orders-moderator/summary/:orderId/client/:clientId',
        component: ClientProfileComponent,
        data: {isModerator : true}
      },
      {
        path: 'orders-retoucher/summary/:orderId/client/:clientId',
        component: ClientProfileComponent,
        data: {isModerator : false,  isAdmin: false}
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

}
