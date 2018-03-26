import { Injectable, Inject } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { FirebaseApp } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/fromPromise';
import { Thenable } from 'firebase/app';
import { Ng2PicaService } from '../../../core/image-picker/ng2-pica.service';


@Injectable()
export class ProfileService {

  constructor(private firebase: FirebaseApp, private db: AngularFireDatabase, private ng2PicaService: Ng2PicaService) {
  }

  generateKey(action): string {
    const uid = firebase.auth().currentUser.uid;
    return this.db.database.ref().child('Files/' + uid + '/' + action + '/').push().key;
  }

  putFileToStorage(action, file: File) {
    const key = this.generateKey(action);
    const subject = new Subject();
    this.uploadAsSubject(action, file, key, subject);
    return subject;
  }

  private uploadAsSubject(action, file, key, subject: Subject<any>) {
    const uid = firebase.auth().currentUser.uid;
    const task = firebase.storage().ref(`Profiles/${uid}/${action}/${key}`).put(file, {
      contentDisposition: `attachment; filename="${file.name}"`
    });
    task.on('state_changed',
      snapshot => {
        const percent = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        subject.next({
          percent: percent,
          url: task.snapshot.downloadURL,
          isSuccess: task.snapshot.state === 'success',
          isMini: file.isMini || '',
          name: file.name,
          filename: file.name,
          key: key
        });
      },
      err => subject.error(err),
      () => {
        subject.next({
          percent: 100,
          url: task.snapshot.downloadURL,
          isSuccess: task.snapshot.state === 'success',
          isMini: file.isMini || '',
          name: file.name,
          filename: file.name,
          key: key
        });
      }
    );
  }

  saveExamples(photos: any[]) {
    const data = {};
    for (const photo of photos) {
      data[photo.key] = photo;
    }
    const uid = firebase.auth().currentUser.uid;
    return this.db.database.ref().child('Files/' + uid + '/Examples/').update(data);
  }

  private uploadFiles(action, file: File, key, subject?: Subject<any>, name?, description?) {
    const uid = firebase.auth().currentUser.uid;
    const task = firebase.storage().ref('Profiles/' + uid + '/' + action + '/' + key).put(file, {
      contentDisposition: `attachment; filename="${file.name}"`
    });

    if (subject) {
      task.on('state_changed',
        snapshot => {
          subject.next((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        err => subject.error(err),
        () => {
          this.setFileMetadata(key, action, file.name, task.snapshot.downloadURL, name, description);
          return task.snapshot.downloadURL;
        }
      );
    } else {
      return Observable.fromPromise(task);
    }
  }

  simplePutFileToStorage(action, file: File, key, name?, description?) {
    return this.simpleFileUpload(action, file, key).then(downloadURL => {
      return this.setFileMetadata(key, action, file.name, downloadURL, name, description);
    });
  }

  private simpleFileUpload(action, file: File, key): Thenable<string> {
    const uid = firebase.auth().currentUser.uid;
    return firebase.storage().ref('Profiles/' + uid + '/' + action + '/' + key).put(file, {
      contentDisposition: `attachment; filename="${file.name}"`
    }).then(response => {
      return response.downloadURL;
    }).catch(err => {
      throw err;
    });
  }

  updateSharing(shareId, name, link) {
    return this.putUsersInfoToDatabase({
      sharing: {
        name: name,
        shareId: shareId.toString(),
        link: link
      }
    });
  }

  putUsersInfoToDatabase(data) {
    const uid = firebase.auth().currentUser.uid;
    return this.db.database.ref().child('Users/' + uid).update(data);
  }

  getUsersInfoFromDatabase() {
    const uid = firebase.auth().currentUser.uid;
    return this.db.object('Users/' + uid);
  }

  private setFileMetadata(key, action, filename, url, name?, description?) {
    const uid = firebase.auth().currentUser.uid;
    const data = {
      name: name || null,
      description: description || null,
      filename: filename,
      url: url
    };
    return this.db.database.ref().child('Files/' + uid + '/' + action + '/' + key).set(data);
  }

  public removeFileFromStorage(action, key, additionalFile?: string): Promise<any> {
    const uid = firebase.auth().currentUser.uid;
    const promises = [
      firebase.storage().ref('Profiles/' + uid + '/' + action + '/' + key).delete(),
      this.db.database.ref().child('Files/' + uid + '/' + action + '/' + key).remove()
    ];
    if (additionalFile) {
      promises.push(firebase.storage().ref('Profiles/' + uid + '/' + action + '/' + additionalFile).delete());
    }
    return Promise.all(promises);
  }

  public getFilesMetadata(action) {
    const uid = firebase.auth().currentUser.uid;
    return this.db.list('Files/' + uid + '/' + action).map((res) => {
      return res;
    });
  }

  public resizeImages(images: File[]): Promise<File[]> {
    const resized = [];
    return new Promise((resolve, reject) => {
      this.ng2PicaService.resize(images, 160).subscribe((result) => {
        result.isMini = true;
        resized.push(result);
        if (resized.length === images.length) {
          resolve(resized);
        }
      });
    });
  }
}
