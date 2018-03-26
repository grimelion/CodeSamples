import { Component, ViewEncapsulation } from '@angular/core';
import { MediaReplay } from './core/media-replay';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  constructor(mediaReplay: MediaReplay) {}
}
