/* tslint:disable:no-access-missing-member */

import { Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';
import { MediaChange } from '@angular/flex-layout';
import { Router, NavigationEnd } from '@angular/router';
import { AuthorizationService } from '../../shared/authorization.sevice';
import { Auth } from '../../shared/auth';
import { Observable } from 'rxjs/Observable';
import { MediaReplay } from '../../core/media-replay';
import { WindowRef } from '../../shared/window-ref';
import { DefaultConfigService } from '../../core/default-config.service';

@Component({
  selector: 'app-admin',
  templateUrl: 'admin.component.html',
  styleUrls: ['admin.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdminComponent implements OnInit, OnDestroy {

  @ViewChild('sidenav') sidenav;
  @ViewChild('scrollContainer') scrollContainer;

  private _mediaSubscription: Subscription;
  sidenavOpen = false;
  sidenavMode = 'side';
  isMobile = false;

  private _routerEventsSubscription: Subscription;

  user$: Observable<Auth>;
  translationsLoaded$: Observable<boolean>;

  constructor(
    private mediaReplay: MediaReplay,
    private router: Router,
    private authorizationService: AuthorizationService,
    private titleService: Title,
    private windowRef: WindowRef,
    private defaultConfigService: DefaultConfigService
  ) {
    titleService.setTitle('SimpleProject');
    this.authorizationService.setClient();
    this.translationsLoaded$ = defaultConfigService.translationsLoaded;
  }

  ngOnInit() {
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
        this.scrollContainer.nativeElement.scrollTop = 0;
      }
    });

    this.defaultConfigService.getTranslations('client');
    this.user$ = this.authorizationService.getAuth();
  }

  ngOnDestroy() {
    this._mediaSubscription.unsubscribe();
  }

  signOut() {
    this.authorizationService.signOut().then(() => this.router.navigateByUrl('login'));
  }

  openSupport() {
    const win = this.windowRef.getNativeWindow().open('https://simpleProject.com/faq?utm_source=client-cabinet&utm_medium=cabinet-links&utm_campaign=howto-link', '_blank');
    if (win) {
      // Browser has allowed win to be opened
      win.focus();
    } else {
      // Browser has blocked it
      console.log('Error window.open');
      // alert('Please allow popups for this website');
    }
  }
}
