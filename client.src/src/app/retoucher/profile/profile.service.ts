import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { AuthorizationService } from '../../shared/authorization.sevice';

@Injectable()
export class ProfileService {
  constructor(private afAuth: AngularFireAuth,
              private db: AngularFireDatabase,
              private authService: AuthorizationService) {
  }

  updateDisplayName(displayName) {
    const uid = this.afAuth.auth.currentUser.uid;
    return this.authService.setUserMetadata({displayName: displayName});
  }

  updateAvatar(imageFile: File) {
    return this.authService.updateAvatar(imageFile);
  }

  updateEmail(newEmail) {
    return firebase.auth().currentUser.updateEmail(newEmail);
  }

  updateSkypeNickname(skype: string) {
    const uid = this.afAuth.auth.currentUser.uid;
    return firebase.database().ref(`Users/${uid}`).update({skype: skype});
  }

  updatePassword(newPassword) {
    return firebase.auth().currentUser.updatePassword(newPassword);
  }

  updatePhone(newPhone) {
    const uid = this.afAuth.auth.currentUser.uid;
    return firebase.database().ref(`Users/${uid}/`).update({phone: newPhone});
  }

  updateCard(newCard) {
    const uid = this.afAuth.auth.currentUser.uid;
    return firebase.database().ref(`Users/${uid}/`).update({card: newCard});
  }

  getProfile() {
    const uid = this.afAuth.auth.currentUser.uid;
    return this.db.object(`Users/${uid}`);
  }

}
