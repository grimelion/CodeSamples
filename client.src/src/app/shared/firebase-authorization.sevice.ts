import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { AuthorizationService } from './authorization.sevice';
import { Auth } from './auth';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { WindowRef } from './window-ref';

@Injectable()
export class FirebaseAuthorizationService extends AuthorizationService {

  private authSubject = new ReplaySubject<Auth>(1);
  private isClient = false;

  constructor(private db: AngularFireDatabase,
              private afAuth: AngularFireAuth,
              private windowRef: WindowRef) {
    super();
    this.afAuth.authState.subscribe((auth) => {
      this.authSubject.next(new Auth(auth ? auth : {}));
    });
  }

  setClient() {
    this.isClient = true;
  }

  updateAvatar(imageFile: File) {
    const uid = this.afAuth.auth.currentUser.uid;
    return firebase.storage().ref().child(`Userpics/${uid}`).put(imageFile).then(res => {
      return this.setUserMetadata({photoURL: res.downloadURL});
    });
  }

  setUserMetadata(metadata: {displayName?: string, email?: string, photoURL?: string}, updateProfile = true) {
    const uid = this.afAuth.auth.currentUser.uid;
    const profile = {
      displayName:  metadata.displayName || firebase.auth().currentUser.displayName || firebase.auth().currentUser.email,
      photoURL: metadata.photoURL || firebase.auth().currentUser.photoURL || ''
    };
    if (updateProfile) {
      firebase.auth().currentUser.updateProfile(profile).then(() => {
        this.authSubject.next(new Auth(firebase.auth().currentUser));
      }).catch(error => {throw error; });
    }
    if (this.isClient) {
      metadata['isClient'] = !!this.isClient;
    }
    return firebase.database().ref(`Users/${uid}`).update(metadata);
  }

  createUserWithEmailAndPassword(email: string, password: string) {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  }

  signInWithEmailAndPassword(email: string, password: string) {
    return firebase.auth().signInWithEmailAndPassword(email, password)
      .then((auth) => {
        if (auth) {
          const photo = auth.photoURL || 'assets/img/avatars/noavatar.png';
          return this.setUserMetadata({email: auth.email, photoURL: photo});
        }
        return null;
      });
  }

  getRoles() {
    return this.getAuth().mergeMap(auth => {
      if (auth.uid) {
        return this.db.object(`Roles/${auth.uid}/`);
      } else {
        return Observable.of({});
      }
    });
  }

  signInWithGoogle() {
    const a = new firebase.auth.GoogleAuthProvider();
    a.setCustomParameters({
      'redirect_uri': 'https://client.simpleProject.com/__/auth/handler'
    });
    console.log(a);
    const promise = firebase.auth().signInWithPopup(a).then((data) => {
      this.setUserMetadata({displayName: data.user.displayName, email: data.user.email, photoURL: data.user.photoURL});
    });
    console.log(this.windowRef.getLastOpenedWindow());
    return promise;
  }

  updatePassword(newPassword) {
    return firebase.auth().currentUser.updatePassword(newPassword);
  };

  updateEmail(newEmail) {
    return firebase.auth().currentUser.updateEmail(newEmail);
  }

  sendPasswordResetEmail(email) {
    return firebase.auth().sendPasswordResetEmail(email);
  };

  signOut() {
    return firebase.auth().signOut();
  };

  getAuth(): Observable<Auth> {
    return this.authSubject.asObservable();
  }
}
