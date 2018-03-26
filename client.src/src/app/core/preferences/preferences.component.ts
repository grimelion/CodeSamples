/* tslint:disable:no-access-missing-member */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { fadeInAnimation } from '../../route.animation';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { LoginBaseComponent } from '../login-base.component';
import { Router } from '@angular/router';
import { MdSnackBar } from '@angular/material';
import { AuthorizationService } from '../../shared/authorization.sevice';
import { Subscription } from 'rxjs/Subscription';
import { DefaultConfigService } from '../default-config.service';
import { PreferencesService } from './preferences.service';
import { Notifications } from './notifications';
import { AppImagePickerComponent, ImageFileInputChooseEvent } from '../image-picker/image-picker.component';

@Component({
  selector: 'app-preferences',
  templateUrl: 'preferences.component.html',
  styleUrls: ['preferences.component.scss'],
  animations: [fadeInAnimation],
})
export class PreferencesComponent extends LoginBaseComponent implements OnInit, OnDestroy {

  public userImageFile: File;
  public notifications: FormGroup;
  public name: FormGroup;
  public email: FormGroup;
  public password: FormGroup;
  public userImagePhotoURL: string;
  public avatar: FormGroup;
  public formGroup: FormGroup;

  private componentSubscriptions: Subscription[];
  private fields: Array<string> = ['email', 'password', 'notifications', 'avatar'];

  constructor(protected router: Router,
              protected snackBar: MdSnackBar,
              protected defaultConfigService: DefaultConfigService,
              public authorizationService: AuthorizationService,
              private preferencesService: PreferencesService,
              private formBuilder: FormBuilder) {
    super(router, snackBar, defaultConfigService, authorizationService);
  }

  ngOnInit() {
    this.setFormSettings();
  }

  saveNotifications(notificatons) {
    return this.preferencesService.setNotifications(notificatons);
  }

  onUserImageFile(event: ImageFileInputChooseEvent) {
    this.userImageFile = event.imageFile;
  }

  updateAvatar() {
    return this.authorizationService.updateAvatar(this.userImageFile);
  }

  setFormSettings() {
    const password = new FormControl('', CustomValidators.rangeLength([6, 30]));
    const email = new FormControl('', CustomValidators.email);

    this.password = this.formBuilder.group({
      password: password,
      passwordConfirm: new FormControl('', CustomValidators.equalTo(password)),
    });

    this.notifications = this.formBuilder.group({
      emailOrderCreated: [false],
      emailOrderApprove: [false],
      emailOrderReady: [false]
    });

    this.email = this.formBuilder.group({
      email: email
    });

    this.formGroup = this.formBuilder.group({
      email: email,
      notifications: this.notifications,
      password: this.password
    });

    this.componentSubscriptions = [
      this.authorizationService.getAuth().subscribe((user) => {
        email.patchValue(user.email);
        this.userImagePhotoURL = user.photoURL;
      }),
      this.preferencesService.getNotifications().subscribe((notifications) => {
        this.notifications.patchValue(notifications);
      })
    ];
    this.formGroup.markAsPristine();
  }

  sendData() {
    const fieldServiceRelations = {
      email: 'updateEmail',
      password: 'updatePassword',
      notifications: 'saveNotifications'
    };
    this.isLoading = true;
    const promiseArr = [];
    const updatedFields = [];
    this.fields.forEach(value => {
        if (this.formGroup.controls[value]) {
          if (!this.formGroup.controls[value].pristine && this.formGroup.controls[value].valid) {
            const currentService = fieldServiceRelations[value];
            updatedFields.push(value);
            promiseArr.push(new Promise((res, rej) => {
              this[currentService](this.formGroup.controls[value].value)
              .then(response => {
                res(response);
              })
              .catch(err => {
                rej(err);
              });
            }));
          }
        } else if (value === 'avatar' && this.userImageFile) {
            updatedFields.push(value);
            promiseArr.push(new Promise((res, rej) => {
              this.updateAvatar()
              .then(response => {
                res(response);
              })
              .catch(err => {
                rej(err);
              });
            }));
          }
      });

      Promise.all(promiseArr)
      .then((res) => {
        this.isLoading = false;
        this.successSnackbarHandler(updatedFields.join(', '));
      })
      .catch(err => {
        this.isLoading = false;
        this.errorSnackbarHandler(err);
      });
  }

  updateEmail(value) {
    return this.authorizationService.updateEmail(value);
  }

  updatePassword(value) {
    return this.authorizationService.updatePassword(value.password);
  }

  errorSnackbarHandler(message?) {
    this.snackBar.open(message, 'Close', this.defaultConfigService.mdSnackBarConfig);
  }

  successSnackbarHandler(message?) {
    this.snackBar.open(`Updated: ${message}`, 'Close', this.defaultConfigService.mdSnackBarConfig);
  }

  ngOnDestroy() {
    this.componentSubscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}
