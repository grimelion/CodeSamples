import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Auth } from './auth';

@Injectable()
export abstract class AuthorizationService {
  abstract setClient();
  abstract signOut();
  abstract getAuth(): Observable<Auth>;
  abstract createUserWithEmailAndPassword(email: string, password: string);
  abstract signInWithEmailAndPassword(email: string, password: string);
  abstract signInWithGoogle();
  abstract updatePassword(newPassword: string);
  abstract updateEmail(newEmail: string);
  abstract sendPasswordResetEmail(email);
  abstract updateAvatar(imageFile);
  abstract getRoles(): Observable<any>;
  abstract setUserMetadata(metadata: {displayName?: string, email?: string, photoURL?: string});
}
