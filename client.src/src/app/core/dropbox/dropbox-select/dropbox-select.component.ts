import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { DropboxService } from '../dropbox.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MdSnackBar } from '@angular/material';
import { DefaultConfigService } from '../../default-config.service';

@Component({
  selector: 'app-dropbox-select',
  templateUrl: 'dropbox-select.component.html',
  styleUrls: ['dropbox-select.component.scss']
})
export class DropboxSelectComponent implements OnInit, OnDestroy {

  public folders: Observable<any[]>;
  public foldersSubscription: Subscription;
  public dropboxAuthSubscription: Subscription;
  public currentDropboxPath: Observable<string>;
  public isLoggedIn = false;

  public isLoading = false;
  public showFolders = false;

  @Input()
  public isAdvanced = false;

  @Output()
  public selected = new EventEmitter<any>();

  constructor(private snackBar: MdSnackBar,
              private defaultConfigService: DefaultConfigService,
              private dropboxService: DropboxService) { }

  ngOnInit() {
    this.foldersSubscription = this.dropboxService.folders$.subscribe((folders) => {
      this.isLoading = false;
    });
    this.dropboxAuthSubscription = this.dropboxService.token$.subscribe(token => {
      this.isLoggedIn = !!token;
    });
    this.currentDropboxPath = this.dropboxService.path$;
    this.folders = this.dropboxService.folders$;
  }

  getFolders(path = '', tag = 'folder') {
    if (this.isLoading || tag !== 'folder') {
      return;
    }
    this.isLoading = true;
    this.showFolders = true;
    this.dropboxService.updatePath(path).catch(err => {
      if (err.status === 401) {
        this.isLoading = false;
        this.showFolders = false;
        this.snackBar.open('Dropbox authorization expired. Try again', 'Close', this.defaultConfigService.mdSnackBarConfig);
      } else {
        this.isLoading = false;
        this.showFolders = false;
        this.snackBar.open(err.message, 'Close', this.defaultConfigService.mdSnackBarConfig);
      }
    });
  }

  auth() {
    this.dropboxService.signIn().then(() => {
      this.getFolders();
    }).catch(e => {
      this.snackBar.open(e, 'Close', this.defaultConfigService.mdSnackBarConfig);
    });
  }

  dropboxPathUp() {
    this.isLoading = true;
    this.dropboxService.updatePathUp();
  }

  selectFromDropbox() {
    if (this.isLoggedIn) {
      this.getFolders();
    } else {
      this.auth();
    }
  }

  reLogin() {
    if (this.isLoggedIn) {
      this.dropboxService.reLogin().then(() => {
        this.getFolders();
      }).catch(e => {
        this.snackBar.open(e, 'Close', this.defaultConfigService.mdSnackBarConfig);
      });
    }
  }

  chooseFolder(folder, $event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.showFolders = false;
    this.selected.emit(folder);
  }

  ngOnDestroy() {
    this.foldersSubscription.unsubscribe();
    this.dropboxAuthSubscription.unsubscribe();
  }
}
