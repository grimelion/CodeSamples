import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ImageFileInputChooseEvent } from '../../core/image-picker/image-picker.component';
import { Subscription } from 'rxjs/Subscription';
import { AuthorizationService } from '../../shared/authorization.sevice';
import { ProfileService } from './profile.service';
import { MdSnackBar } from '@angular/material';
import { DefaultConfigService } from '../../core/default-config.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile: FormGroup;
  public displayName: FormGroup;
  public email: FormGroup;
  public password: FormGroup;
  public phone: FormGroup;
  public card: FormGroup;
  public skype: FormGroup;
  public userImagePhotoURL: string;
  public userImageFile: File;
  public isLoading = false;
  public fullName: string;

  private fields = ['displayName', 'avatar', 'email', 'password', 'phone', 'card', 'skype'];
  private componentSubscriptions: Subscription[];

  constructor(private formBuilder: FormBuilder,
              private authorizationService: AuthorizationService,
              private profileService: ProfileService,
              private snackBar: MdSnackBar,
              private defaultConfigService: DefaultConfigService) { }

  ngOnInit() {
    const password = new FormControl('', CustomValidators.rangeLength([6, 30]));
    const email = new FormControl('', CustomValidators.email);
    this.profile = this.formBuilder.group({
      displayName: ['', [CustomValidators.rangeLength([2, 40])]],
      password: password,
      passwordConfirm: ['', [CustomValidators.equalTo(password)]],
      email: email,
      phone: ['', [CustomValidators.rangeLength([6, 15])]],
      card: ['', [Validators.pattern(new RegExp('^[0-9]{16}$'))]],
      skype: ['', [CustomValidators.rangeLength([4, 20])]],
    });

    this.componentSubscriptions = [
      this.authorizationService.getAuth().subscribe((user) => {
        email.patchValue(user.email);
        this.userImagePhotoURL = user.photoURL;
      }),
    ];

    this.profileService.getProfile().take(1).subscribe(result => {
      this.profile.patchValue(result);
      this.fullName = result.displayName || result.email;
    });

    this.profile.markAsPristine();
  }

  onUserImageFile(event: ImageFileInputChooseEvent) {
    this.userImageFile = event.imageFile;
  }

  updateDisplayName(displayName) {
    return this.profileService.updateDisplayName(displayName);
  }

  updateEmail(email) {
    return this.profileService.updateEmail(email);
  }

  updatePassword(password) {
    return this.profileService.updatePassword(password);
  }

  updateSkypeNickname(skypeNickname: string) {
    return this.profileService.updateSkypeNickname(skypeNickname);
  }

  updatePhone(phone) {
    return this.profileService.updatePhone(phone);
  }

  updateCard(card) {
    return this.profileService.updateCard(card);
  }

  updateAvatar() {
    return this.profileService.updateAvatar(this.userImageFile);
  }

  sendData() {
    const fieldServiceRelations = {
      avatar:     'updateAvatar',
      email:      'updateEmail',
      password:   'updatePassword',
      phone:      'updatePhone',
      card:       'updateCard',
      skype:     'updateSkypeNickname'
    };
    this.isLoading = true;
    const promiseArr = [];
    const updatedFields = [];
    this.fields.forEach(value => {
        if (this.profile.controls[value]) {
          const control = this.profile.controls[value];
          if (!control.pristine && control.valid) {
            const currentService = fieldServiceRelations[value];
            updatedFields.push(value);
            promiseArr.push(this[currentService](control.value));
          }
        } else if (value === 'avatar' && this.userImageFile) {
            updatedFields.push(value);
            promiseArr.push(new Promise((res, rej) => {
              this.updateDisplayName(this.fullName);
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
        let output = updatedFields.join(', ');
        output = output.charAt(0).toUpperCase() + output.slice(1);
        this.successSnackbarHandler(output);
      })
      .catch(err => {
        this.isLoading = false;
        this.errorSnackbarHandler(err);
      });
  }

  errorSnackbarHandler(message?) {
    this.snackBar.open(message, 'Close', this.defaultConfigService.mdSnackBarConfig);
  }

  successSnackbarHandler(message?) {
    this.snackBar.open(`updated ${message}`, 'Close', this.defaultConfigService.mdSnackBarConfig);
  }

  ngOnDestroy() {
    this.componentSubscriptions.forEach(sub => sub.unsubscribe());
  }
}
