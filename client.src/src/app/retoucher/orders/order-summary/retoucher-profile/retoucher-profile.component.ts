import { Component, OnInit } from '@angular/core';
import { fadeInAnimation } from '../../../../route.animation';
import { PageComponent } from '../../../../core/page/page.component';

@Component({
  selector: 'app-retoucher-profile',
  templateUrl: './retoucher-profile.component.html',
  styleUrls: ['./retoucher-profile.component.scss'],
  animations: [fadeInAnimation]
})
export class RetoucherProfileComponent extends PageComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit() {
  }

}
