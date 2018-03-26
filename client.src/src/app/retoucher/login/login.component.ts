/* tslint:disable:no-access-missing-member */
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MdSnackBar } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { fadeInAnimation } from '../../route.animation';
import { LoginBaseComponent } from '../../core/login-base.component';
import { DefaultConfigService } from '../../core/default-config.service';
import { AuthorizationService } from '../../shared/authorization.sevice';

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
              private titleService: Title) {
    super(router, snackBar, defaultConfigService, authorizationService);
    titleService.setTitle('Login - Retoucher');
  }

  ngOnInit() {
    this.emailPassword = new FormGroup({
      email: new FormControl('', CustomValidators.email),
      password: new FormControl('', CustomValidators.rangeLength([6, 30]))
    });
  }
}
