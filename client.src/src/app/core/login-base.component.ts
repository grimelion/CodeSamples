import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PageComponent } from './page/page.component';
import { MdSnackBar } from '@angular/material';
import { AuthorizationService } from '../shared/authorization.sevice';
import { FormGroup } from '@angular/forms';
import { fadeInAnimation } from '../route.animation';
import { DefaultConfigService } from './default-config.service';
import { Thenable } from 'firebase/app';

@Component({
  selector: 'app-login-base',
  template: `<div></div>`,
  animations: [ fadeInAnimation ]
})
export class LoginBaseComponent extends PageComponent {

  // For spinner usage
  public isLoading = false;

  constructor(protected router: Router,
              protected snackBar: MdSnackBar,
              protected defaultConfigService: DefaultConfigService,
              public authorizationService: AuthorizationService) {
    super();
  }

  protected signInSuccess() {
    this.isLoading = false;
    this.router.navigate(['']);
  }

  protected signInFailure(e) {
    this.snackBar.open(e ? e : 'Unknown Error', 'Close', this.defaultConfigService.mdSnackBarConfig);
    this.isLoading = false;
  }

  public signIn(form: FormGroup): void {
    if (!form.valid) {
      return;
    }
    const formModel = form.value;
    this.isLoading = true;
    this.authorizationService.signInWithEmailAndPassword(formModel.email, formModel.password)
      .then((user) => {
        this.signInSuccess();
        return user;
      })
      .catch((e) => {
        this.signInFailure(e);
        return null;
      });
  }

  public signInWithGoogle() {
    this.isLoading = true;
    return this.authorizationService.signInWithGoogle()
      .then((user) => {
        this.signInSuccess();
        return user;
      })
      .catch((e) => this.signInFailure(e));
  }

  public signUp(form: FormGroup): Promise<any> {
    if (!form.valid) {
      return;
    }
    const formModel = form.value;
    this.isLoading = true;
    return this.authorizationService.createUserWithEmailAndPassword(formModel.email, formModel.password)
      .then((user) => {
        this.authorizationService.setUserMetadata({email: user.email, displayName: formModel.displayName, photoURL: user.photoURL});
        this.signInSuccess();
        return user;
      })
      .catch((e) => {
        this.signInFailure(e);
        return null;
      });
  }

  public recover(form: FormGroup): void {
    if (!form.valid) {
      return;
    }
    const formModel = form.value;
    this.isLoading = true;
    this.authorizationService.sendPasswordResetEmail(formModel.email).then(() => {
      this.snackBar.open('Check your inbox!', 'Close', this.defaultConfigService.mdSnackBarConfig);
      this.isLoading = false;
    }).catch((e) => {
      this.signInFailure(e);
    });
  }
}
