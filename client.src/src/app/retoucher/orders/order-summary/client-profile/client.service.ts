import { Injectable, Inject } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { OrdersService } from '../../orders.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class ClientProfileService {

  constructor(private db: AngularFireDatabase,
              private ordersService: OrdersService) {
  }

  public getUserFilesData(uid: string, action: string) {
    return this.db.list(`Files/${uid}/${action}`).map((res) => {
      return res;
    });
  }

  public getUserData(uid: string) {
    return this.db.object(`Users/${uid}/`);
  }

  public setInfoForRetoucher(value, orderId: string, clientId: string) {
    return this.ordersService.getRetouchers(value.assignedRetoucherId).first().toPromise().then(result => {
      const retoucher = {
        id: value.assignedRetoucherId || '',
        displayName: result.displayName || ''
      };
      const update = {
        clientId: clientId,
        retoucherComment: value.retoucherComment,
        internalInfo: value.internalInfo
      };
      if (retoucher.id) {
        update['assignedRetoucher'] = retoucher;
      }
      return firebase.database().ref(`Request/ModeratorSetClientProfile/${clientId}`).update(update);
    });
  }

  public setSuperData(value, clientId: string) {
    return firebase.database().ref(`SuperClientData/${clientId}`).update(value);
  }

  public getPublicData(clientId: string) {
    return this.db.object(`PublicClientData/${clientId}/`);
  }

  public getPrivateData(clientId: string) {
    return this.db.object(`PrivateClientData/${clientId}/`);
  }

  public getSuperData(clientId: string) {
    return this.db.object(`SuperClientData/${clientId}/`);
  }
}
