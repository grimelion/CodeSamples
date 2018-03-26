import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Auth } from '../../../shared/auth';
import { AuthorizationService } from '../../../shared/authorization.sevice';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { MdDialogRef, MdDialogConfig, MdDialog, MdSnackBar, MdSnackBarConfig } from '@angular/material';
import { ChooseFileDialog } from './choose-dialog/choose-file.dialog';
import { ProfileService } from './profile.service';
import { AppImageToolComponent } from '../../../core/image-tool/image-tool.component';
import {DropboxService} from '../../../core/dropbox/dropbox.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {

  private filterDialog: MdDialogRef<ChooseFileDialog>;

  public isLoading = false;
  public progress: Number;
  public portfolioForm: FormGroup;

  public user$: Observable<Auth>;
  public presets$: Observable<any[]>;
  public actions$: Observable<any[]>;
  public photos$: Observable<any[]>;

  private profileSubscription: Subscription;
  public sharing: {shareId: string, name: string, link: string} = {shareId: '', name: '', link: ''};

  constructor(private authorizationService: AuthorizationService,
              private router: Router,
              public dialog: MdDialog,
              private profileService: ProfileService,
              private formBuilder: FormBuilder,
              private snackBar: MdSnackBar,
              private dropboxService: DropboxService) { }

  ngOnInit() {
    this.portfolioForm = this.formBuilder.group({
      portfolio: [''],
      facebookPage: [''],
      additionalProfiles: [''],
      note: [''],
      instructions: ['']
    });
    this.user$ = this.authorizationService.getAuth();

    this.presets$ = this.profileService.getFilesMetadata('Presets').share();
    this.actions$ = this.profileService.getFilesMetadata('Actions').share();
    this.photos$ = this.profileService.getFilesMetadata('Examples').share();

    this.profileSubscription = this.profileService.getUsersInfoFromDatabase().subscribe(res => {
      this.portfolioForm.patchValue(res);
      if (res.sharing) {
        this.sharing = res.sharing;
      }
    });
  }

  onRemovePhoto(photo) {
    this.profileService.removeFileFromStorage('Examples', photo.$key, photo.miniUrlKey).then((res) => {
      this.isLoading = false;
    }).catch((err) => {
      console.log(err);
      this.isLoading = false;
    });
  }

  onFilesChanged(files) {
    // this.profileService();
    console.log(`Files: ${files}`);
  }

  removeFile(action, key) {
    this.profileService.removeFileFromStorage(action, key).then((res) => {
      this.isLoading = false;
    }).catch((err) => {
      this.isLoading = false;
    });
  }

  saveUsersData(data) {
    this.profileService.putUsersInfoToDatabase(data).then(() => {
      this.snackBar.open('Data updated', 'Close', <MdSnackBarConfig>{
        duration: 1000,
      });
    });
  }

  openPresetDialog() {
    this.openChooseFileDialog('Presets', '.lrt, .lrtemplate');
  }

  openActionDialog() {
    this.openChooseFileDialog('Actions', '.atn');
  }

  private openChooseFileDialog(action, extension) {
    let config = new MdDialogConfig();
    config = <MdDialogConfig>{
      data: {
        action: action,
        extension: extension
      }
    };
    this.filterDialog = this.dialog.open(ChooseFileDialog, config);
  }

  openUploadExamples() {
    (<HTMLInputElement>document.getElementById('custom-file-upload')).click();
  }

  onGalleryPhotos(event: any) {
    const files = event.target.files;
    if (files && files.length) {
      this.isLoading = true;
      this.uploadExamples(files).then(() => {
        this.isLoading = false;
      }).catch(err => console.error(err));
    }
  }

  uploadExamples(photos: FileList): Promise<any> {
    console.log(photos);
    let progressTotal = 0;
    const readyPhotos = [];
    const promisesArr: Array<any> = [];
    return this.profileService.resizeImages(Array.from(photos)).then(_photos => {
      _photos = _photos.concat(Array.from(photos));
      for (const photo of _photos) {
        const sub = this.profileService.putFileToStorage('Examples', photo);
        promisesArr.push(new Promise((resolve, reject) => {
          let progress = 0;
          sub.subscribe(
            (result: any) => {
              progressTotal += result.percent - progress;
              progress = result.percent;
              this.progress = parseInt((progressTotal / _photos.length).toFixed(), 10);
              if (result.isSuccess) {
                console.log(result);
                const found = readyPhotos.find((p) => p.filename === photo.name);
                if (found) {
                  if (found.isMini) {
                    found.miniUrl = found.url;
                    found.miniUrlKey = found.key;
                    found.url = result.url;
                    found.key = result.key;
                  } else {
                    found.miniUrl = result.url;
                    found.miniUrlKey = result.key;
                  }
                } else {
                  readyPhotos.push(result);
                }
                sub.complete();
                resolve();
              }
            },
            (err) => {
              reject();
            },
            () => {
            });
        }));
      }
      return Promise.all(promisesArr).then(() => {
        console.log(readyPhotos);
        this.profileService.saveExamples(readyPhotos);
      });
    });
  }

  shareFolder(folder) {
    this.isLoading = true;
    this.dropboxService.shareFolder(folder).then(shareId => {
      this.dropboxService.createSharedLink(folder.path_display).then(link => {
        this.profileService.updateSharing(shareId, folder.name, link).then(res => {
          this.snackBar.open('Data updated', 'Close', <MdSnackBarConfig>{
            duration: 1000,
          });
          this.isLoading = false;
        });
      });
    });
  }

  redirect() {
    this.router.navigate(['./preferences']);
  }

  ngOnDestroy(): void {
    this.profileSubscription.unsubscribe();
  }
}
