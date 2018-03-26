import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from '../app.component';
import { SidenavComponent } from '../core/sidenav/sidenav.component';
import {
  MdButtonModule, MdCardModule, MdCheckboxModule, MdCoreModule, MdDialogModule, MdIconRegistry, MdInputModule,
  MdMenuModule, MdOptionModule, MdProgressBarModule, MdRadioModule, MdSidenavModule, MdSlideToggleModule, MdListModule,
  MdToolbarModule, MdSnackBarModule, MdSelectModule, MdTabsModule, MdDatepickerModule, MdNativeDateModule, DateAdapter,
  MD_DATE_FORMATS
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
import { PageNotFoundComponent } from '../core/page-not-found/page-not-found.component';
import { SharedModule } from '../shared/shared.module';
import { AppImagePickerComponent } from '../core/image-picker/image-picker.component';
import { AppImageToolComponent } from '../core/image-tool/image-tool.component';
import { ProfileService } from '../retoucher/profile/profile.service';
import { ClientProfileService } from './orders/order-summary/client-profile/client.service';
import { ClientProfileComponent } from './orders/order-summary/client-profile/client-profile.component';

import { DropboxService } from '../core/dropbox/dropbox.service';
import { SortableTableComponent } from '../core/sortable-table/sortable-table.component';
import { FilterDialog } from '../core/sortable-table/dialogs/filter.dialog';
import { DebounceDirective } from '../core/debounce.directive';
import { DefaultConfigService } from '../core/default-config.service';
import { Ng2PicaService } from '../core/image-picker/ng2-pica.service';
import { LoggedInGuard } from './logged-in.guard';
import { PageComponent } from '../core/page/page.component';
import { LoginComponent } from './login/login.component';
import { LoginBaseComponent } from '../core/login-base.component';
import { PreferencesService } from '../core/preferences/preferences.service';
import { OrderSummaryComponent } from './orders/order-summary/order-summary.component';
import { OrdersComponent } from './orders/orders-moderator/orders-moderator.component';
import { OrdersService } from './orders/orders.service';
import { ProfileComponent } from './profile/profile.component';
import { OrdersRetoucherComponent } from './orders/orders-retoucher/orders-retoucher.component';
import { RetoucherSummaryComponent } from './orders/orders-retoucher/retoucher-summary/retoucher-summary.component';
import { OrdersRetoucherService } from './orders/orders-retoucher/orders-retoucher.service';
import { DropboxSelectComponent } from '../core/dropbox/dropbox-select/dropbox-select.component';
import { RetoucherProfileComponent } from './orders/order-summary/retoucher-profile/retoucher-profile.component';
import { OrderModalActionsComponent } from '../core/order-modal-actions/order-modal-actions.component';
import { SureModalComponent } from '../core/sure-modal/sure-modal.component';
import { FaComponent } from '../core/fa.component';
import { MediaReplay } from '../core/media-replay';
import { ModeratorOrderActionsComponent } from './orders/moderator-order-actions/moderator-order-actions.component';
import { RetoucherOrderActionsComponent } from './orders/retoucher-order-actions/retoucher-order-actions.component';
import { UahPipe } from './uah.pipe';
import { UploadAnalyzerComponent } from './orders/order-summary/upload-analyzer/upload-analyzer.component';
import { ClientsComponent } from './clients/clients.component';
import { ClientsService } from './clients/clients.service';
import { MailTemplatesComponent } from './mail-templates/mail-templates.component';
import { MailTemplatesService } from './mail-templates/mail-templates.service';
import { MailTemplateComponent } from './mail-templates/mail-template/mail-template.component';
import { RetouchersComponent } from './retouchers/retouchers.component';
import { RetouchersService } from './retouchers/retouchers.service';
import { CodemirrorComponent } from '../core/codemirror/codemirror.component';
import { MY_DATE_FORMATS, MyDateAdapter } from 'app/core/my-date-adapter';
import { OrdersAdminComponent } from './orders/orders-admin/orders-admin.component';
import { ModeratorSummaryComponent } from './orders/orders-moderator/moderator-summary/moderator-summary.component';
import { AdminOrderActionsComponent } from './orders/admin-order-actions/admin-order-actions.component';
import { OrdersModeratorBriefComponent } from './orders/orders-moderator/orders-moderator-brief.component';
import { ModeratorsComponent } from './moderators/moderators.component';
import { OrdersRetoucherBriefComponent } from './orders/orders-retoucher/orders-retoucher-brief.component';

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
    AppImagePickerComponent,
    OrdersComponent,
    OrderSummaryComponent,
    ProfileComponent,
    OrdersRetoucherComponent,
    RetoucherSummaryComponent,
    ModeratorSummaryComponent,
    AdminOrderActionsComponent,
    OrdersAdminComponent,
    OrdersModeratorBriefComponent,
    ModeratorsComponent,
    OrdersRetoucherBriefComponent,
    DropboxSelectComponent,
    RetoucherProfileComponent,
    ClientProfileComponent,
    RetoucherProfileComponent,
    OrderModalActionsComponent,
    SureModalComponent,
    AppImageToolComponent,
    FaComponent,
    ModeratorOrderActionsComponent,
    RetoucherOrderActionsComponent,
    UahPipe,
    UploadAnalyzerComponent,
    ClientsComponent,
    MailTemplatesComponent,
    MailTemplateComponent,
    RetouchersComponent,
    CodemirrorComponent
  ],
  entryComponents: [
    FilterDialog,
    OrderModalActionsComponent,
    SureModalComponent,
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
    MdSidenavModule, MdProgressBarModule, MdInputModule, MdOptionModule, MdSnackBarModule,
    MdToolbarModule, MdCardModule, MdDialogModule, MdSlideToggleModule, MdSelectModule, MdDatepickerModule,
    MdNativeDateModule,
    MdTabsModule,
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
    OrdersService,
    ProfileService,
    OrdersRetoucherService,
    ClientProfileService,
    MediaReplay,
    NgBoxService,
    ClientsService,
    RetouchersService,
    MailTemplatesService,
    {provide: DateAdapter, useClass: MyDateAdapter},
    {provide: MD_DATE_FORMATS, useValue: MY_DATE_FORMATS},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
