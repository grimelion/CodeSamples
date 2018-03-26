import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { PageComponent } from '../../core/page/page.component';
import { fadeInAnimation } from '../../route.animation';
import { IntrojsService } from '../../core/introjs.service';
import { StorageService } from '../../shared/storage.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [fadeInAnimation],
})
export class DashboardComponent extends PageComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private introjsService: IntrojsService, private storageService: StorageService) {
    super();
  }

  ngAfterViewInit() {
    // tooltipPosition: 'right',
    if (!this.storageService.getObjectFromLocalStorage('skipIntro')) {
      setTimeout(() => {
        this.storageService.setObjectToLocalStorage('skipIntro', true);
        this.introjsService.setOptions({
          exitOnOverlayClick: false,
          exitOnEsc: false,
          overlayOpacity: 0.4,
          scrollToElement: false,
          showBullets: false,
          showStepNumbers: false,
          disableInteraction: true,
          steps: [
            {
              intro: '<div style="height: 49px;"><div class="intro-js-title">Welcome to SimpleProject Studio client area!</div><div class="intro-js-text">Take a quick look on how to start.</div></div>'
            },
            {
              position: 'right',
              element: document.querySelector('#profile-menu-item'),
              intro: '<div class="intro-js-text">Firstly, please, fill in your Photographer’s profile. Here we can find everything we need to match your style.</div>'
            },
            {
              position: 'right',
              element: document.querySelector('#wedding-card'),
              intro: '<div class="intro-js-text">Once your Photographer’s profile is completed, you can submit your orders in just a few clicks. If you need to place a wedding order (color correction, culling or both), please, click here.</div>'
            },
            {
              position: 'right',
              element: document.querySelector('#retouching-card'),
              intro: '<div class="intro-js-text">If you need to place a retouching order (of any complexity – form basic to editorial), please, click here.</div>'
            },
            {
              position: 'right',
              element: document.querySelector('#orders-menu-item'),
              intro: '<div class="intro-js-text">You can find all your orders at Orders page. Here you can check order status, approximate completion date and download ready images.</div>'
            },
          ]
        });
        this.introjsService.start(1);
      }, 200);
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.introjsService.exit();
  }
}
