/* tslint:disable:no-access-missing-member */
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {fadeInAnimation} from '../../../route.animation';
import {Router} from '@angular/router';
import { MdSnackBar } from '@angular/material';
import { AuthorizationService } from '../../../shared/authorization.sevice';
import { FormGroup, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { LoginBaseComponent } from '../../../core/login-base.component';
import { DefaultConfigService } from '../../../core/default-config.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  animations: [ fadeInAnimation ]
})
export class ForgotPasswordComponent extends LoginBaseComponent implements OnInit {

  email: FormGroup;

  constructor(protected router: Router,
              protected snackBar: MdSnackBar,
              protected defaultConfigService: DefaultConfigService,
              public authorizationService: AuthorizationService,
              private titleService: Title) {
    super(router, snackBar, defaultConfigService, authorizationService);
    titleService.setTitle('Forgot password - SimpleProject');
    this.authorizationService.setClient();
  }

  ngOnInit() {
    this.email = new FormGroup({
      email: new FormControl('', CustomValidators.email)
    });
  }

  send() {
    this.router.navigate(['/']);
  }

}
