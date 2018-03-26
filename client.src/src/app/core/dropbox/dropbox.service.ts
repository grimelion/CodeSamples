import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';
import { WindowRef } from '../../shared/window-ref';
import { StorageService } from '../../shared/storage.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DropboxCopyReference } from './dropbox-copy-refernce';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import * as _ from 'lodash';

@Injectable()
export class DropboxService {

  private CLIENT_ID = environment.dropboxClientId;
  private params: string[] = ['dialog=yes'];

  private tokenSubject = new BehaviorSubject<string>('');
  public get token$(): Observable<string> {
    return this.tokenSubject.asObservable();
  }

  private pathSubject = new BehaviorSubject<string>('');
  public get path$(): Observable<string> {
    return this.pathSubject.asObservable();
  }

  private foldersSubject = new BehaviorSubject<any[]>([]);
  public get folders$(): Observable<any[]> {
    return this.foldersSubject.asObservable();
  }

  constructor(private windowRef: WindowRef, private storage: StorageService, private zone: NgZone, private http: Http) {
    this.tokenSubject.next(this.storage.localStorage.getItem('dropboxToken'));
  }

  getSharedFolders() {
    return this._sharingListFolders({limit: 20}).then(response => {
      return response;
    }).catch(err => console.error(err));
  }

  private shareFolderById(shared_folder_id) {
    return this._sharingAddFolderMember({
      shared_folder_id: shared_folder_id, members: [{
        member: {
          '.tag': 'email',
          email: environment.dropboxEmail
        },
        access_level: 'editor'
      }], quiet: true
    }).then((res) => {
        return Promise.resolve(shared_folder_id);
      });
  }

  shareFolder(folder): Promise<string> {
    if (folder.sharing_info && !folder.sharing_info.read_only) {
      return this.shareFolderById(folder.sharing_info.shared_folder_id);
    } else {
      return this._sharingShareFolder({path: folder.path_display, force_async: false}).then((response) => {
        return this.shareFolderById(response.shared_folder_id);
      });
    }
  }

  sharingMountFolder(shared_folder_id) {
    return this._sharingMountFolder({shared_folder_id: shared_folder_id});
  }

  createSharedLink(path): Promise<string> {
    return this._sharingCreateSharedLink({path: path}).then(res => {
      return res.url;
    }).catch((err) => {
      console.log(err);
      return '';
    });
  }

  updatePath(path = ''): Promise<any> {
    this.pathSubject.next(path);
    return this._filesListFolder({path: path}).then((response) => {
      const res = _.sortBy(response.entries, ['.tag', 'path_lower']);
      this.foldersSubject.next(res);
      return res;
    }).catch((err) => {
      console.error(err);
      this.foldersSubject.next([]);
      throw err;
    });
  }

  updatePathUp(): void {
    this.updatePath(this.pathSubject.getValue().replace(/\/[^\/]+\/?$/, ''));
  };

  filesSaveUrl(url, path) {
    this._filesSaveUrl({path: path, url: url}).then((response) => {
      console.log(response);
    }).catch((err) => {
      console.error(err);
    });
  }

  filesCopyReferenceGet(path): Promise<DropboxCopyReference> {
    return this._filesCopyReferenceGet({path: path}).then((response) => {
      return new DropboxCopyReference(response.copy_reference, response.metadata['.tag'] === 'file', response.metadata.name);
    });
  }

  reLogin(): Promise<any> {
    this.storage.localStorage.setItem('dropboxToken', '');
    this.tokenSubject.next('');
    return this.signIn();
  }

  public signIn(): Promise<any> {
    const window = this.windowRef.getNativeWindow();
    // const dbx = new Dropbox({ clientId: this.CLIENT_ID });
    const authUrl = this.getAuthenticationUrl(window.location.origin + '/redirect');
    const dropboxTokenWindow = this.windowRef.getNativeWindow().open(authUrl, 'DropboxAuthPopup', this.params.join(','));

    return new Promise((resolve, reject) => {
      const interval = window.setInterval(
        () => {
          if (dropboxTokenWindow.closed) {
            window.clearInterval(interval);
            reject('dropbox popup closed');
          }
          try {
            if (dropboxTokenWindow.location.origin === window.location.origin) {
              let access_token;
              try {
                console.log(dropboxTokenWindow.location.hash);
                access_token = dropboxTokenWindow.location.hash.split('#')
                  .filter(elem => elem.startsWith('access_token'))[0]
                  .split('=')[1].split('&')[0];
              } catch (err) {
                access_token = '';
              }
              window.clearInterval(interval);
              dropboxTokenWindow.close();
              if (access_token) {
                this.storage.localStorage.setItem('dropboxToken', access_token);
                this.tokenSubject.next(access_token);
                resolve(access_token);
              } else {
                reject('Could not make dropbox login!');
              }
            }
          } catch (err) {
            // suppress errors!
            // console.error(err);
          }
        }, 1000);
    });
  }

  // dropbox API calls

  private getAuthenticationUrl (redirectUri, state = '') {
    const AUTH_BASE_URL = 'https://www.dropbox.com/oauth2/authorize';
    const clientId = this.CLIENT_ID;
    let authUrl;
    if (!clientId) {
      throw new Error('A client id is required. You can set the client id using .setClientId().');
    }
    if (!redirectUri) {
      throw new Error('A redirect uri is required.');
    }
    authUrl = AUTH_BASE_URL + '?response_type=token&client_id=' + clientId;
    if (redirectUri) {
      authUrl = authUrl + '&redirect_uri=' + redirectUri;
    }
    if (state) {
      authUrl = authUrl + '&state=' + state;
    }
    return authUrl;
  };

  private _filesListFolder(arg) {
    return this.request('files/list_folder', arg, 'user', 'api', 'rpc');
  };

  private _filesSaveUrl(arg) {
    return this.request('files/save_url', arg, 'user', 'api', 'rpc');
  };

  private _filesCopyReferenceSave(arg) {
    return this.request('files/copy_reference/save', arg, 'user', 'api', 'rpc');
  };

  private _filesCopyReferenceGet(arg) {
    return this.request('files/copy_reference/get', arg, 'user', 'api', 'rpc');
  };

  private _sharingListFolders(arg) {
    return this.request('sharing/list_folders', arg, 'user', 'api', 'rpc');
  };

  private _sharingMountFolder(arg) {
    return this.request('sharing/mount_folder', arg, 'user', 'api', 'rpc');
  };

  private _sharingAddFolderMember(arg) {
    return this.request('sharing/add_folder_member', arg, 'user', 'api', 'rpc');
  };

  private _sharingShareFolder(arg) {
    return this.request('sharing/share_folder', arg, 'user', 'api', 'rpc');
  };

  private _sharingCreateSharedLink(arg) {
    return this.request('sharing/create_shared_link', arg, 'user', 'api', 'rpc');
  };

  private _sharingCreateSharedLinkWithSettings(arg) {
    return this.request('sharing/create_shared_link_with_settings', arg, 'user', 'api', 'rpc');
  }

  private request(path, args, auth, host, style) {
    switch (style) {
      case 'rpc':
        return this.rpcRequest(path, args, auth, host, this.tokenSubject.getValue());
      // case 'download':
      //   request = this.getDownloadRequest();
      //   break;
      // case 'upload':
      //   request = this.getUploadRequest();
      //   break;
      default:
        throw new Error('Invalid request style: ' + style);
    }
  };

  private getBaseURL(host) {
    return 'https://' + host + '.dropboxapi.com/2/';
  }

  rpcRequest(path, body, auth, host, accessToken) {
    const bodyString = JSON.stringify(body);
    const headers = new Headers({'Content-Type': 'application/json'});
    switch (auth) {
      case 'team':
      case 'user':
        headers.append('Authorization', 'Bearer ' + accessToken);
        break;
      case 'noauth':
        break;
      default:
        throw new Error('Unhandled auth type: ' + auth);
    }
    const options = new RequestOptions({headers: headers});

    return this.http.post(this.getBaseURL(host) + path, bodyString, options) // ...using post request
      .map((res: Response) => res.json()) // ...and calling .json() on the response to return data
      .catch((error: any) => {
        let msg = error.json().error || 'Server error';
        msg = msg['.tag'] || msg;
        if (error.status === 401) {
          this.storage.localStorage.setItem('dropboxToken', '');
          this.tokenSubject.next('');
        }
        return Observable.throw({message: msg, status: error.status});
      }).toPromise();
  }
}
