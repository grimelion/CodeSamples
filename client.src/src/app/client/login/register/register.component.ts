import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { fadeInAnimation } from '../../../route.animation';
import { Router } from '@angular/router';
import { MdSnackBar } from '@angular/material';
import { AuthorizationService } from '../../../shared/authorization.sevice';
import { FormGroup, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { LoginBaseComponent } from '../../../core/login-base.component';
import { DefaultConfigService } from '../../../core/default-config.service';
import { PreferencesService } from '../../../core/preferences/preferences.service';
import { Notifications } from '../../../core/preferences/notifications';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  animations: [ fadeInAnimation ]
})
export class RegisterComponent extends LoginBaseComponent implements OnInit {

  emailPasswordConfirm: FormGroup;

  constructor(protected router: Router,
              protected snackBar: MdSnackBar,
              protected defaultConfigService: DefaultConfigService,
              public authorizationService: AuthorizationService,
              private preferencesService: PreferencesService,
              private titleService: Title) {
    super(router, snackBar, defaultConfigService, authorizationService);
    titleService.setTitle('Sign up - SimpleProject');
    this.authorizationService.setClient();
  }

  ngOnInit() {
    this.emailPasswordConfirm = new FormGroup({
      email: new FormControl('', CustomValidators.email),
      displayName: new FormControl('', CustomValidators.rangeLength([2, 40])),
      password: new FormControl('', CustomValidators.rangeLength([6, 30]))
    });
  };

  signUp(form: FormGroup): Promise<any> {
    if (!form.valid) {
      return;
    }
    return super.signUp(form);
  }
}
