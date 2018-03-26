import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from '../app.component';
import { SidenavComponent } from '../core/sidenav/sidenav.component';
import {
  MdButtonModule, MdCheckboxModule, MdIconRegistry, MdInputModule, MdMenuModule, MdOptionModule,
  MdProgressBarModule, MdSidenavModule, MdSnackBarModule, MdCardModule,
  MdToolbarModule, MdSlideToggleModule, MdRadioModule, MdCoreModule,
  MdListModule, MdTabsModule, MdSelectModule,
} from '@angular/material';
import { NgBoxModule } from 'ngbox/ngbox.module';
import { NgBoxService } from 'ngbox/ngbox.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SidenavItemComponent } from '../core/sidenav-item/sidenav-item.component';
import { SidenavService } from '../core/sidenav/sidenav.service';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { RoutingModule } from './app-routing.module';
import { HighlightModule } from '../core/highlightjs/highlight.module';
import { AdminComponent } from './admin/admin.component';
import { QuillModule } from 'ngx-quill';
import { LoadingOverlayComponent } from '../core/loading-overlay/loading-overlay.component';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdersComponent } from './orders/orders.component';
import { ProfileComponent } from './profile/profile/profile.component';
import { PreferencesComponent } from '../core/preferences/preferences.component';
import { PageComponent } from '../core/page/page.component';
import { LoginComponent } from './login/login/login.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { RegisterComponent } from './login/register/register.component';
import { LoginBaseComponent } from '../core/login-base.component';
import { CreateOrderComponent } from '../client/orders/order-type/new-order/create-order/create-order.component';
import { AddFilesComponent } from '../client/orders/order-type/new-order/add-files/add-files.component';
import { CheckoutComponent } from '../client/orders/order-type/new-order/checkout/checkout.component';
import { AppImageToolComponent } from '../core/image-tool/image-tool.component';
import { DragAndDropComponent } from '../core/drag-n-drop/drag-n-drop.component';
import { NewOrderComponent } from './orders/order-type/new-order/new-order.component';
import { OrdersService } from './orders/orders.service';
import { OrderSummaryComponent } from './orders/order-summary/order-summary.component';
import { PreferencesService } from '../core/preferences/preferences.service';
import { PageNotFoundComponent } from '../core/page-not-found/page-not-found.component';
import { SharedModule } from '../shared/shared.module';
import { AppImagePickerComponent } from '../core/image-picker/image-picker.component';
import { DropboxService } from '../core/dropbox/dropbox.service';
import { SortableTableComponent } from '../core/sortable-table/sortable-table.component';
import { FilterDialog } from '../core/sortable-table/dialogs/filter.dialog';
import { DebounceDirective } from '../core/debounce.directive';
import { DefaultConfigService } from '../core/default-config.service';
import { Ng2PicaService } from '../core/image-picker/ng2-pica.service';
import { LoggedInGuard } from './logged-in.guard';
import { ChooseFileDialog } from './profile/profile/choose-dialog/choose-file.dialog';
import { ProfileService } from './profile/profile/profile.service';
import { DropboxSelectComponent } from '../core/dropbox/dropbox-select/dropbox-select.component';
import { OrderModalActionsComponent } from '../core/order-modal-actions/order-modal-actions.component';
import { OrderPayComponent } from './orders/order-pay/order-pay.component';
import { FaComponent } from '../core/fa.component';
import { MdDialogModule } from '@angular/material';
import { MediaReplay } from '../core/media-replay';
import { TranslatePipe } from '../core/translate.pipe';
import { IntrojsService } from '../core/introjs.service';
import { CheckoutGuard } from './orders/order-type/new-order/checkout.guard';

@NgModule({
  declarations: [
    AppComponent,
    SidenavComponent,
    SidenavItemComponent,
    AdminComponent,
    LoadingOverlayComponent,
    PageComponent,
    LoginComponent,
    PageNotFoundComponent,
    LoginBaseComponent,
    FilterDialog,
    SortableTableComponent,
    DebounceDirective,
    OrderSummaryComponent,
    DashboardComponent,
    ProfileComponent,
    PreferencesComponent,
    ForgotPasswordComponent,
    RegisterComponent,
    NewOrderComponent,
    AppImageToolComponent,
    ChooseFileDialog,
    CreateOrderComponent,
    AddFilesComponent,
    CheckoutComponent,
    DragAndDropComponent,
    AppImagePickerComponent,
    OrdersComponent,
    DropboxSelectComponent,
    OrderModalActionsComponent,
    OrderPayComponent,
    FaComponent,
    TranslatePipe
  ],
  entryComponents: [
    FilterDialog,
    ChooseFileDialog,
    OrderModalActionsComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule,
    RoutingModule,
    MdListModule, MdButtonModule, MdCheckboxModule, MdRadioModule, MdMenuModule, MdCoreModule,
    MdSidenavModule, MdProgressBarModule, MdInputModule, MdTabsModule, MdSelectModule,
    MdOptionModule, MdSnackBarModule, MdToolbarModule, MdCardModule, MdDialogModule, MdSlideToggleModule,
    FlexLayoutModule,
    PerfectScrollbarModule,
    QuillModule,
    HighlightModule,
    SharedModule,
    BrowserAnimationsModule,
    NgBoxModule
  ],
  providers: [
    Title,
    SidenavService,
    MdIconRegistry,
    DropboxService,
    DefaultConfigService,
    PreferencesService,
    Ng2PicaService,
    LoggedInGuard,
    CheckoutGuard,
    OrdersService,
    ProfileService,
    MediaReplay,
    NgBoxService,
    IntrojsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
