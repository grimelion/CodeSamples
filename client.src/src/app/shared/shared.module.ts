import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseAuthorizationService } from './firebase-authorization.sevice';
import { AuthorizationService } from './authorization.sevice';
import { StorageService } from './storage.service';
import { WindowRef } from './window-ref';
import { AngularFireModule } from 'angularfire2';
import { environment } from '../../environments/environment';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';

@NgModule({
  imports: [
    CommonModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule, // imports firebase/database, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features
  ],
  entryComponents: [
  ],
  declarations: [],
  providers: [
    StorageService,
    WindowRef,
    { provide: AuthorizationService, useClass: FirebaseAuthorizationService }
  ]
})
export class SharedModule { }
