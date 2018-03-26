import { Injectable, Inject, OnDestroy } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthorizationService } from '../../shared/authorization.sevice';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Auth } from '../../shared/auth';
import { Notifications } from './notifications';
import { Thenable } from 'firebase/app';

@Injectable()
export class PreferencesService {

  constructor(private afDatabase: AngularFireDatabase,
              private afAuth: AngularFireAuth) { }

  public setNotifications(notifications: Notifications): Thenable<any> {
    const uid = this.afAuth.auth.currentUser.uid;
    if (uid) {
      return this.afDatabase.object(`Preferences/Notifications/${uid}`).set(notifications);
    } else {
      return Promise.reject('No uid');
    }
  }

  public getNotifications(): Observable<Notifications> {
    const uid = this.afAuth.auth.currentUser.uid;
    let notifications$;
    notifications$ = this.afDatabase.object(`Preferences/Notifications/${uid}`, {
      preserveSnapshot: true
    });
    return notifications$.map((_order) => {
      const obj = _order.val();
      return obj || new Notifications();
    });
  }
}
