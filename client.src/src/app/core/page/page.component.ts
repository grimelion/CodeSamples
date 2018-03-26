import { Component, OnInit, HostBinding } from '@angular/core';
import {fadeInAnimation} from '../../route.animation';

@Component({
  selector: 'app-page',
  templateUrl: 'page.component.html',
  styleUrls: ['page.component.scss'],
  animations: [fadeInAnimation],
})
export class PageComponent implements OnInit {
  @HostBinding('@fadeInAnimation') fadeInAnimation = 'true';

  constructor() { }

  ngOnInit() {
  }

}
