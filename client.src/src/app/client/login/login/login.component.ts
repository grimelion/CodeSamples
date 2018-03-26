/* tslint:disable:no-access-missing-member */
import { Component, NgZone, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { fadeInAnimation } from '../../../route.animation';
import { PageComponent } from '../../../core/page/page.component';
import { MdSnackBar } from '@angular/material';
import { AuthorizationService } from '../../../shared/authorization.sevice';
import { FormGroup, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { LoginBaseComponent } from '../../../core/login-base.component';
import { DefaultConfigService } from '../../../core/default-config.service';
import { StorageService } from '../../../shared/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [ fadeInAnimation ]
})
export class LoginComponent extends LoginBaseComponent implements OnInit {

  emailPassword: FormGroup;

  constructor(protected router: Router,
              protected snackBar: MdSnackBar,
              protected defaultConfigService: DefaultConfigService,
              public authorizationService: AuthorizationService,
              private titleService: Title,
              private zone: NgZone) {
    super(router, snackBar, defaultConfigService, authorizationService);
    titleService.setTitle('Login - SimpleProject');
    this.authorizationService.setClient();
  }

  ngOnInit() {
    this.emailPassword = new FormGroup({
      email: new FormControl('', CustomValidators.email),
      password: new FormControl('', CustomValidators.rangeLength([6, 30]))
    });
    this.emailPassword.markAsTouched();
  }

  signInWithGoogle() {
    super.signInWithGoogle().then(() => {
      this.zone.runOutsideAngular(() => {
        location.reload();
      });
    });
  }
}
