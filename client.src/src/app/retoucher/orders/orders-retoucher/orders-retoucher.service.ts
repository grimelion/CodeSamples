import { OnInit, Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';
import { Query } from 'angularfire2/interfaces';
import { SampleStatus, UploadType, WorkStatus } from '../../../core/enums';
import { RetoucherSummary } from './retoucher-summary/retoucher-summary';
import { Thenable } from 'firebase/app';

@Injectable()
export class OrdersRetoucherService implements OnInit {
  constructor(private afAuth: AngularFireAuth, private db: AngularFireDatabase) {  }

  private parseOrder(order: any) {
    const obj = order;
    obj.id = order.$key;
    obj.statusText = WorkStatus.getNameForCode(<number>obj.status);
    if (obj.status !== WorkStatus.Pending && obj.status !== WorkStatus.New && obj.wantToApprove) {
      obj.sampleStatusText = SampleStatus.getNameForCode(<number>obj.sampleStatus || 0);
    }
    obj.color = WorkStatus.getColorForCode(<number>obj.status);
    obj.sampleColor = SampleStatus.getColorForCode(<number>obj.sampleStatus);
    if (order.upload) {
      obj.description.uploadType = UploadType.getName(Object.keys(order.upload)[0]);
    }
    return obj;
  }

  getTodos(columnName = '', sortOrder = 'asc'): Observable<any> {
    const uid = firebase.auth().currentUser.uid;
    let orders$;

    const query: Query = {};
    if (columnName) {
      query.orderByChild = columnName;
    } else {
      query.orderByKey = true;
    }
    orders$ = this.db.list(`Orders/Retoucher/${uid}`, {
      query: query
    });
    return orders$.map((_orders) => {
      const orders = [];
      _orders.map((order) => {
        if (sortOrder === 'desc') {
          orders.unshift(this.parseOrder(order));
        } else {
          orders.push(this.parseOrder(order));
        }
      });
      return orders;
    });
  }

  public getTodoSummary(orderId: string): Observable<RetoucherSummary> {
    const uid = firebase.auth().currentUser.uid;
    return this.db.object(`Orders/Retoucher/${uid}/${orderId}`).map((_order) => {
      return this.parseOrder(_order);
    });
  }

  public acceptOrder(orderId) {
    const uid = firebase.auth().currentUser.uid;
    return firebase.database().ref(`Request/RetoucherAcceptOrder/${uid}`).set({orderId: orderId, ts: new Date().getTime()});
  }

  public dissociateRetoucher(orderId) {
    const uid = firebase.auth().currentUser.uid;
    return firebase.database().ref(`Request/RetoucherDissociate/${uid}`).set({orderId: orderId, ts: new Date().getTime()});
  }

  public sendOrder(data: {orderId: string, comment: string, retoucherLink: string}): Thenable<any> {
    console.log(data);
    const uid = firebase.auth().currentUser.uid;
    data['ts'] = new Date().getTime();
    return firebase.database().ref(`Request/RetoucherOrderApprove/${uid}`).set(data);
  }

  ngOnInit() {
  }
}
