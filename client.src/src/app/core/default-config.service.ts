import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { MdSnackBarConfig } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class DefaultConfigService {

  private _translations: any;
  private translationsLoadedSubject = new BehaviorSubject<boolean>(false);

  mdSnackBarConfig: MdSnackBarConfig;

  constructor(private db: AngularFireDatabase) {
    this.mdSnackBarConfig = new MdSnackBarConfig();
    this.mdSnackBarConfig.duration = 5000;
  }

  get translationsLoaded() {
    return this.translationsLoadedSubject.asObservable();
  }
  get translations() {
    return this._translations;
  }

  getTranslations(app: string) {
    this.db.object('Text/' + app).take(1).subscribe(res => {
      this._translations = res;
      this.translationsLoadedSubject.next(true);
    });
  }
}
