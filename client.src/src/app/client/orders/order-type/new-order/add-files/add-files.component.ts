import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {  MdSnackBar } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
import { OrdersService } from '../../../orders.service';
import { DefaultConfigService } from '../../../../../core/default-config.service';
import { DropboxService } from '../../../../../core/dropbox/dropbox.service';
import { ProfileService } from '../../../../profile/profile/profile.service';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { WindowRef } from '../../../../../shared/window-ref';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-add-files',
  templateUrl: './add-files.component.html',
  styleUrls: ['./add-files.component.scss']
})
export class AddFilesComponent implements OnInit, OnDestroy {

  public files: File[];

  public isLoading = false;
  public isBusy = false;

  public isWeddingOrder = false;
  public isRetouchingOrder = false;
  public isTrialSet = false;

  public isShareFolder = 0;
  public upload = '';
  public progress: Number;
  private profileSubscription: Subscription;
  private clientOrderSubscription: Subscription;
  public sharing: {shareId: string, name: string, link: string} = {shareId: '', name: '', link: ''};
  public copying: {copyId: string, name: string, link: string} = {copyId: '', name: '', link: ''};
  public url: FormGroup;
  private progressSubscription: Subscription;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private ordersService: OrdersService,
              private snackBar: MdSnackBar,
              private defaultConfigService: DefaultConfigService,
              private dropboxService: DropboxService,
              private profileService: ProfileService,
              private windowRef: WindowRef,
              private formBuilder: FormBuilder) {
    this.files = [];
    this.url = formBuilder.group({
      otherUrl: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.profileSubscription = this.profileService.getUsersInfoFromDatabase().subscribe(res => {
      if (res.sharing) {
        this.sharing = res.sharing;
      }
    });
    this.clientOrderSubscription = this.ordersService.clientOrder$.subscribe((clientOrder) => {
      if (!clientOrder.name) {
        this.router.navigate(['orders']);
      }
      this.isWeddingOrder = clientOrder.type === 'wedding';
      this.isRetouchingOrder = !this.isWeddingOrder;
      this.isTrialSet = clientOrder.trial;
    });
    this.progressSubscription = this.ordersService.uploadProgress$.subscribe(progress => {
      this.progress = progress;
    });
  }

  private checkFiles(files: File[]) {
    if (!files.length) {
      return false;
    } else if (files.length > 300) {
      this.snackBar.open('Your upload exceeds 300 items limit', 'Close', this.defaultConfigService.mdSnackBarConfig);
      return false;
    }
    let totalSize = 0;
    files.forEach((file: File) => {
      totalSize += file.size;
    });
    if (totalSize / 1048576 > 1024 * 3) {
      this.snackBar.open('Your upload exceeds 3GB limit', 'Close', this.defaultConfigService.mdSnackBarConfig);
      return false;
    }
    return true;
  }

  setUploading() {
    if (!this.checkFiles(this.files)) {
      return;
    }
    this.isBusy = true;
    const clientTimestamp = Date.now().toString();
    this.ordersService.uploadFiles(this.files, clientTimestamp).then(res => {
      this.isBusy = false;
      if (res) {
        this.saveOrderAndCheckout();
      } else {
        this.snackBar.open('File upload error', 'Close', this.defaultConfigService.mdSnackBarConfig);
      }
    });
  }

  setDropbox(isValid) {
    if (!isValid) {
      return;
    }
    this.isLoading = true;
    if (!this.isShareFolder) {
      this.ordersService.updateClientOrder('upload', {
        copying: this.copying
      });
    } else {
      this.ordersService.updateClientOrder('upload', {
        sharing: this.sharing
      });
    }
    this.saveOrderAndCheckout();
  }

  setLinking(url: FormGroup) {
    if (!url.valid) {
      url.get('otherUrl').markAsTouched();
      return;
    }
    this.ordersService.updateClientOrder('upload', {
      linking: {
        link: this.url.value.otherUrl
      }
    });
    this.saveOrderAndCheckout();
  }

  filesCopyReferenceGet(folder) {
    this.isLoading = true;

    console.log('here');
    this.dropboxService.filesCopyReferenceGet(folder.path_display).then(dropboxCopyReference => {
      this.dropboxService.createSharedLink(folder.path_display).then(link => {
        this.copying = {
          copyId: dropboxCopyReference.copy_reference,
          name: folder.name,
          link: link
        };
        this.ordersService.updateClientOrder('upload', {copying: this.copying});
        this.isLoading = false;
      });
    });
  }

  fileChanged(files: File[]) {
    this.checkFiles(files);
    this.files = files;
  }

  public saveOrderAndCheckout() {
    this.ordersService.createOrder().then(() => {
      this.router.navigate(['../checkout'], { relativeTo: this.route });
    });
  }

  ngOnDestroy() {
    this.profileSubscription.unsubscribe();
    this.clientOrderSubscription.unsubscribe();
    this.progressSubscription.unsubscribe();
  }
}
