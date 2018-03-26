/* tslint:disable:no-access-missing-member */

import { Component, OnInit, Inject, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { Router, NavigationEnd } from '@angular/router';
import { AuthorizationService } from '../../shared/authorization.sevice';
import { Auth } from '../../shared/auth';
import { Observable } from 'rxjs/Observable';
import { SidenavService } from '../../core/sidenav/sidenav.service';
import { SidenavItem } from '../../core/sidenav-item/sidenav-item.model';
import { MediaReplay } from '../../core/media-replay';
import { DefaultConfigService } from '../../core/default-config.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdminComponent implements OnInit, OnDestroy {

  @ViewChild('sidenav') sidenav;

  private _mediaSubscription: Subscription;
  sidenavOpen = false;
  sidenavMode = 'side';
  isMobile = false;

  private _routerEventsSubscription: Subscription;

  user$: Observable<Auth>;
  translationsLoaded$: Observable<boolean>;

  ordersSidenavItem: SidenavItem;
  clientsSidenavItem: SidenavItem;
  templatesSidenavItem: SidenavItem;
  retouchersSidenavItem: SidenavItem;
  retoucherSidenavItem: SidenavItem;
  adminSidenavItem: SidenavItem;
  superSidenavItem: SidenavItem;
  moderatorsSidenavItem: SidenavItem;
  private _rolesSubscription: Subscription;

  constructor(
    private mediaReplay: MediaReplay,
    private router: Router,
    private authorizationService: AuthorizationService,
    private sidenavService: SidenavService,
    private titleService: Title,
    private defaultConfigService: DefaultConfigService
  ) {
    titleService.setTitle('Retoucher');
    sidenavService.clear();
    sidenavService.addItem('Profile', 'cog', '/profile', 6);
    this.translationsLoaded$ = defaultConfigService.translationsLoaded;
  }

  ngOnInit() {
    this._rolesSubscription = this.authorizationService.getRoles().subscribe(result => {
      if (!this.retoucherSidenavItem  && result['isRetoucher']) {
        this.retoucherSidenavItem = this.sidenavService.addItem('Retoucher', 'bars', '/orders-retoucher', 4);
      } else if (this.retoucherSidenavItem && !result['isRetoucher']) {
        this.sidenavService.removeItem(this.retoucherSidenavItem);
      }
      if (!this.adminSidenavItem && result['isAdmin']) {
        this.adminSidenavItem = this.sidenavService.addItem('Admin', 'bars', '/orders-admin', 2);
        this.moderatorsSidenavItem = this.sidenavService.addItem('Moderators', 'briefcase', '/moderators', 5);
        this.retouchersSidenavItem = this.sidenavService.addItem('Retouchers', 'briefcase', '/retouchers', 5);
      } else if (this.adminSidenavItem && !result['isAdmin']) {
        this.sidenavService.removeItem(this.adminSidenavItem);
        this.sidenavService.removeItem(this.moderatorsSidenavItem);
        this.sidenavService.removeItem(this.retouchersSidenavItem);
      }
      if (!this.ordersSidenavItem && result['isModerator']) {
        this.ordersSidenavItem = this.sidenavService.addItem('Moderator', 'bars', '/orders-moderator', 3);
      } else if (this.ordersSidenavItem && !result['isModerator']) {
        this.sidenavService.removeItem(this.ordersSidenavItem);
      }
      if (!this.clientsSidenavItem && result['isSuper']) {
        this.superSidenavItem = this.sidenavService.addItem('Super', 'bars', '/orders-super', 1);
        this.clientsSidenavItem = this.sidenavService.addItem('Clients', 'user', '/clients', 5);
        this.templatesSidenavItem = this.sidenavService.addItem('Mail Templates', 'envelope-o', '/mail-templates', 7);
      } else if (this.clientsSidenavItem && !result['isSuper']) {
        this.sidenavService.removeItem(this.clientsSidenavItem);
        this.sidenavService.removeItem(this.templatesSidenavItem);
      }
    });
    this._mediaSubscription = this.mediaReplay.media$.subscribe((change: MediaChange) => {
      const isMobile = (change.mqAlias === 'xs') || (change.mqAlias === 'sm');
      this.isMobile = isMobile;
      this.sidenavMode = (isMobile) ? 'over' : 'side';
      this.sidenavOpen = !isMobile;
    });

    this._routerEventsSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.isMobile) {
          this.sidenav.close();
        }
      }
    });
    this.user$ = this.authorizationService.getAuth();
    this.defaultConfigService.getTranslations('retoucher');
  }

  ngOnDestroy() {
    this._mediaSubscription.unsubscribe();
    this._rolesSubscription.unsubscribe();
    this._routerEventsSubscription.unsubscribe();
  }

  onActivate(e, scrollContainer) {
    scrollContainer.scrollTop = 0;
  }

  signOut() {
    this.authorizationService.signOut().then(() => this.router.navigateByUrl('login'));
  }
}
