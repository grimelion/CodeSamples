import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';
import { Query } from 'angularfire2/interfaces';
import { WorkStatus, transformCurrency, SampleStatus, UploadType } from '../../core/enums';
import { OrderSummary } from './order-summary/order-summary';
import 'rxjs/add/operator/take';
import { Thenable } from 'firebase/app';

@Injectable()
export class OrdersService {

 constructor(private afAuth: AngularFireAuth, private db: AngularFireDatabase) {  }

  private parseOrder(order: any, isAlternativeStatus = false) {
    const obj = order;
    if (order.name) {
      obj.id = order.$key;
    }
    obj.price = transformCurrency(obj.price);
    obj.statusText = WorkStatus.getNameForCode(<number>obj.status, isAlternativeStatus);
    if (obj.status !== WorkStatus.Pending && obj.status !== WorkStatus.New && obj.wantToApprove && obj.status !== WorkStatus.Assigned) {
      obj.sampleStatusText = SampleStatus.getNameForCode(<number>obj.sampleStatus || 0, isAlternativeStatus);
    }
    obj.color = WorkStatus.getColorForCode(<number>obj.status);
    obj.sampleColor = SampleStatus.getColorForCode(<number>obj.sampleStatus);
    if (order.upload) {
      obj.description.uploadType = UploadType.getName(Object.keys(order.upload)[0]);
    }
    return obj;
  }

  private _getOrdersBrief(columnName, sortOrder, role, uid) {
    let orders$;
    const query: Query = { };
    if (columnName) {
      query.orderByChild = columnName;
    } else {
      query.orderByKey = true;
    }
    orders$ = this.db.list(`${role}s/${uid}/orders`, {
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

  private _getOrders(columnName, sortOrder, role, uid = null, isAlternativeStatus = false) {
    let orders$;
    const query: Query = { };
    if (columnName) {
      query.orderByChild = columnName;
    } else {
      query.orderByKey = true;
    }
    orders$ = this.db.list(uid ? `Orders/${role}/${uid}` : `Orders/${role}`, {
      query: query
    });
    return orders$.map((_orders) => {
      const orders = [];
      _orders.map((order) => {
        if (sortOrder === 'desc') {
          orders.unshift(this.parseOrder(order, isAlternativeStatus));
        } else {
          orders.push(this.parseOrder(order, isAlternativeStatus));
        }
      });
      return orders;
    });
  }

  public getOrders(columnName = '', sortOrder = 'asc'): Observable<any> {
    const uid = firebase.auth().currentUser.uid;
    return this._getOrders(columnName, sortOrder, 'Moderator', uid);
  }

  public getAdminOrders(columnName = '', sortOrder = 'asc'): Observable<any> {
    const uid = firebase.auth().currentUser.uid;
    return this._getOrders(columnName, sortOrder, 'Admin', uid, true);
  }

  public getSuperOrders(columnName = '', sortOrder = 'asc'): Observable<any> {
    return this._getOrders(columnName, sortOrder, 'Super', false, true);
  }

  public getModeratorOrdersBrief(columnName, sortOrder, uid) {
    return this._getOrdersBrief(columnName, sortOrder, 'Moderator', uid);
  }

  public getRetoucherOrdersBrief(columnName, sortOrder, uid) {
    return this._getOrdersBrief(columnName, sortOrder, 'Retoucher', uid);
  }

  public getClientData(id: string) {
    const publicData = this.db.object(`PublicClientData/${id}`).map(res => { return res; }).take(1);
    const privateData = this.db.object(`PrivateClientData/${id}`).map(res => { return res; }).take(1);
    const adminData = this.db.object(`AdminClientData/${id}`).map(res => { return res; }).take(1);
    return Observable.forkJoin(publicData, privateData);
  }

  public getRetouchers(id?: string): Observable<any> {
    if (id) {
      return this.db.object(`Retouchers/${id}`);
    }
    return this.db.list(`Retouchers/`, {
      query: {
        orderByChild: 'name'
      }
    });
  }

  public getModerators(id?: string): Observable<any> {
    if (id) {
      return this.db.object(`Moderators/${id}`);
    }
    return this.db.list(`Moderators/`, {
      query: {
        orderByChild: 'name'
      }
    });
  }

  public getAdmins(id?: string): Observable<any> {
    if (id) {
      return this.db.object(`Admins/${id}`);
    }
    return this.db.list(`Admins/`, {
      query: {
        orderByChild: 'name'
      }
    });
  }

  public getOrderSummary(orderId: string): Observable<OrderSummary> {
    const uid = firebase.auth().currentUser.uid;
    return this.db.object(`Orders/Moderator/${uid}/` + orderId).map((_order) => {
      return this.parseOrder(_order);
    });
  }

  public getAdminSummary(orderId: string): Observable<OrderSummary> {
    const uid = firebase.auth().currentUser.uid;
    return this.db.object(`Orders/Admin/${uid}/` + orderId).map((_order) => {
      if (_order.name && !_order.finalLink) {
        firebase.database().ref('Request/AdminSetFinalLinks/' + uid).set({
          ts: new Date().getTime(),
          orderId: orderId
        });
      }
      return this.parseOrder(_order, true);
    });
  }

  public getSuperSummary(orderId: string): Observable<OrderSummary> {
    const uid = firebase.auth().currentUser.uid;
    return this.db.object('Orders/Super/' + orderId).map((_order) => {
      if (_order.name && !_order.finalLink) {
        firebase.database().ref('Request/AdminSetFinalLinks/' + uid).set({
          ts: new Date().getTime(),
          orderId: orderId
        });
      }
      return this.parseOrder(_order, true);
    });
  }

  public isTrialAvailable() {
    const uid = firebase.auth().currentUser.uid;
    return this.db.object('SpecialOffers/Trial/' + uid, { preserveSnapshot: true }).map((_trial) => {
      return !_trial.val();
    });
  }

  public assignOrder(
    orderId: string,
    comment: string,
    retoucherId: string,
    retoucherName: string,
    moderatorId: string,
    moderatorName: string,
    isRemote: number,
    moderatorLink = '') {
    const uid = firebase.auth().currentUser.uid;
    return firebase.database().ref('Request/AdminAssignOrder/' + uid).set({
      orderId: orderId,
      comment: comment,
      retoucherId: retoucherId,
      retoucherName: retoucherName,
      moderatorId: moderatorId,
      moderatorName: moderatorName,
      isRemote: isRemote,
      moderatorLink: moderatorLink,
      ts: new Date().getTime()
    });
  }

  public orderSummaryAction(data: {orderId: string, isApproved: boolean, comment?: string}): Thenable<any> {
    const uid = firebase.auth().currentUser.uid;
    if (uid) {
      data['ts'] = new Date().getTime();
      return firebase.database().ref(`Request/ModeratorOrderApprove/${uid}`).set(data);
    } else {
      return Promise.reject('No uid');
    }
  }

  public adminSendToClient(data: {orderId: string}): Thenable<any> {
    const uid = firebase.auth().currentUser.uid;
    if (uid) {
      data['ts'] = new Date().getTime();
      return firebase.database().ref(`Request/AdminSendToClient/${uid}`).set(data);
    } else {
      return Promise.reject('No uid');
    }
  }

  public approvePayment(orderId) {
    const uid = firebase.auth().currentUser.uid;
    if (uid) {
      return firebase.database().ref(`Request/SuperApprovePayment/${uid}`).set({orderId: orderId, ts: new Date().getTime()});
    } else {
      return Promise.reject('No uid');
    }
  }

  public skipSampleApproval(orderId) {
    const uid = firebase.auth().currentUser.uid;
    if (uid) {
      return firebase.database().ref(`Request/AdminSkipSampleApproval/${uid}`).set({orderId: orderId, ts: new Date().getTime()});
    } else {
      return Promise.reject('No uid');
    }
  }

  public removeOrder(orderId) {
    const uid = firebase.auth().currentUser.uid;
    if (uid) {
      return firebase.database().ref(`Request/AdminRemoveOrder/${uid}`).set({orderId: orderId, ts: new Date().getTime()});
    } else {
      return Promise.reject('No uid');
    }
  }

  public removeFiles(orderId) {
    const uid = firebase.auth().currentUser.uid;
    if (uid) {
      return firebase.database().ref(`Request/AdminRemoveFiles/${uid}`).set({orderId: orderId, ts: new Date().getTime()});
    } else {
      return Promise.reject('No uid');
    }
  }

  public dissociateRetoucher(orderId) {
    const uid = firebase.auth().currentUser.uid;
    if (uid) {
      return firebase.database().ref(`Request/RetoucherDissociate/${uid}`).set({orderId: orderId, ts: new Date().getTime()});
    } else {
      return Promise.reject('No uid');
    }
  }

  public updatePrice(params: {orderId: string, retoucherPrice: number, moderatorPrice}) {
    params['ts'] = new Date().getTime();
    const uid = firebase.auth().currentUser.uid;
    if (uid) {
      return firebase.database().ref(`Request/SuperUpdateOrderPrice/${uid}`).set(params);
    } else {
      return Promise.reject('No uid');
    }
  }

  public updateDates(params: {orderId: string, retoucherDeadlineAt: number, deadlineAt: number}) {
    params['ts'] = new Date().getTime();
    const uid = firebase.auth().currentUser.uid;
    if (uid) {
      return firebase.database().ref(`Request/AdminUpdateOrderDates/${uid}`).set(params);
    } else {
      return Promise.reject('No uid');
    }
  }

  public assignAdmin(adminId, orderId) {
    const uid = firebase.auth().currentUser.uid;
    if (uid) {
      return firebase.database().ref(`Request/SuperAssignOrderAdmin/${uid}`).set({
        ts: new Date().getTime(),
        adminId: adminId,
        orderId: orderId
      });
    } else {
      return Promise.reject('No uid');
    }
  }
}
