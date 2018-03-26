import { ReplaySubject } from 'rxjs/ReplaySubject';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

@Injectable()
export class MediaReplay {
  private _media$: ReplaySubject<MediaChange> = new ReplaySubject(1);

  constructor(media: ObservableMedia) {
    media.asObservable()
      .subscribe(res => this._media$.next(res), err => this._media$.error(err), () => this._media$.complete());
  }

  get media$(): Observable<MediaChange> {
    return this._media$.asObservable();
  }
}
