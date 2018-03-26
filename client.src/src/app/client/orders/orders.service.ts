import { Injectable } from '@angular/core';
import { ClientOrder } from './client-order';
import { FirebaseApp } from 'angularfire2';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Query } from 'angularfire2/interfaces';
import * as firebase from 'firebase';
import {
  OrderStatus, ToDo, TurnaroundTime, Pricing, OrderOptions,
  CullingColor, transformCurrency
} from '../../core/enums';
import { OrderSummary } from './order-summary';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Thenable } from 'firebase/app';

@Injectable()
export class OrdersService {

  private RushPricePercentage = 50;
  private ColorCorrectionPrice = 0.23;
  private CullingPrice = 0.04;
  private RetouchingPrice = 2;
  private PhotoManipulationsPrice = 7;
  private downloadLink: string;

  private clientOrderSubject = new BehaviorSubject<ClientOrder>(new ClientOrder());
  private progressSubject = new BehaviorSubject<number>(0);

  public get clientOrder$(): Observable<ClientOrder> {
    return this.clientOrderSubject.asObservable();
  }

  constructor(private firebase: FirebaseApp, private db: AngularFireDatabase) {
  }

  private parseOrder(order: any) {
    if (!<number>order.addedAt) {
      return {};
    }
    const obj = order;
    obj.id = order.$key;
    obj.addedAt = new Date(<number>obj.addedAt);
    obj.price = transformCurrency(obj.price);
    obj.isPending = order.status === OrderStatus.Pending;
    obj.statusText = OrderStatus.getNameForCode(<number>obj.status);
    obj.color = OrderStatus.getColorForCode(<number>obj.status);
    return obj;
  }

  setClientOrder(clientOrder: ClientOrder, orderOptions?: OrderOptions) {
    clientOrder.email = firebase.auth().currentUser.email;
    clientOrder.displayName = firebase.auth().currentUser.displayName;
    clientOrder.description = {};
    if (orderOptions) {
      if (clientOrder.specialOffer) {
        clientOrder.description.specialOffer = orderOptions.pricing.SpecialOffers[clientOrder.todo][clientOrder.specialOffer].name;
      }
      clientOrder.description.turnaroundTime = TurnaroundTime.getNameForCode(
        clientOrder.turnaroundTime,
        orderOptions.pricing.TurnaroundTime[clientOrder.type][clientOrder.turnaroundTime].from,
        orderOptions.pricing.TurnaroundTime[clientOrder.type][clientOrder.turnaroundTime].to);
    }
    switch (clientOrder.todo) {
      case ToDo.CullingAndColorCorrection:
        clientOrder.description.orderTodoText = CullingColor.getNameForCode(clientOrder.cullingLeave);
        clientOrder.description.finalPercentOfImages = clientOrder.cullingLeave;
        break;
      case ToDo.Culling:
        if (!clientOrder.cullingLeave) {
          clientOrder.description.orderTodoText = `Culling (Client didn't specify leave percentage)`;
          clientOrder.description.finalPercentOfImages = 0;
        } else {
          clientOrder.description.orderTodoText = `Cull ${100 - clientOrder.cullingLeave}%`;
          clientOrder.description.finalPercentOfImages = clientOrder.cullingLeave;
        }
        break;
      default:
        clientOrder.description.orderTodoText = ToDo.getNameForCode(clientOrder.todo);
        clientOrder.description.finalPercentOfImages = 0;
        break;
    }
    this.progressSubject.next(0);
    this.clientOrderSubject.next(clientOrder);
  }

  updateClientOrder(key, value) {
    const co = this.clientOrderSubject.getValue();
    co[key] = value;
    this.clientOrderSubject.next(co);
  }

  public createOrder(): Thenable<any> {
    const uid = firebase.auth().currentUser.uid;
    if (uid) {
      return this.firebase.database().ref('Request/ClientOrder/' + uid).set(this.clientOrderSubject.getValue());
    } else {
      return Promise.reject('No uid');
    }
  };

  public getOrders(columnName = '', sortOrder = 'asc'): Observable<any> {
    const uid = firebase.auth().currentUser.uid;
    let orders$;

    const query: Query = { };
    if (columnName) {
      query.orderByChild = columnName;
    } else {
      query.orderByKey = true;
    }
    orders$ = this.db.list('Orders/Client/' + uid, {
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

  public getOrderSummary(orderId: string): Observable<OrderSummary> {
    const uid = firebase.auth().currentUser.uid;
    return this.db.object('Orders/Client/' + uid + '/' + orderId).map((_order) => {
      return this.parseOrder(_order);
    });
  }

  public isTrialAvailable() {
    const uid = firebase.auth().currentUser.uid;
    return this.db.object('SpecialOffers/Trial/' + uid, { preserveSnapshot: true }).map((_trial) => {
      return !_trial.val();
    });
  }

  public get uploadProgress$(): Observable<number> {
    return this.progressSubject.asObservable();
  }

  public uploadFiles(files, clientTimestamp): Promise<boolean> {
    const uid = firebase.auth().currentUser.uid;
    this.updateClientOrder('clientTimestamp', clientTimestamp);
    const promisesArr: Array<any> = [];
    const uploading = {
      folder: `Orders/${uid}/${clientTimestamp}`,
      files: []
    };
    let newFileName = 0;
    let progressTotal = 0;
    for (const file of files) {
      newFileName++;
      promisesArr.push(new Promise((resolve, reject) => {
        const sub = this.uploadFile(newFileName, file, clientTimestamp);
        let progress = 0;
        sub.subscribe(
          ({percent, downloadLink, isSuccess}) => {
            progressTotal += percent - progress;
            progress = percent;
            this.progressSubject.next(parseInt((progressTotal / files.length).toFixed(), 10));
            if (isSuccess) {
              uploading.files.push({name: file.name, link: downloadLink});
              sub.complete();
              resolve();
            }
          },
          (err) => {
            reject();
          },
          () => {
          }
        );
      }));
    }
    return Promise.all(promisesArr).then(res => {
      this.updateClientOrder('upload', {
        uploading: uploading
      });
      console.log(uploading);
      return true;
    }).catch(err => {
      firebase.storage().ref(`Orders/${uid}/${clientTimestamp}`).delete();
      return false;
    });
  }

  private uploadFile(name, file: File, clientTimestamp: string) {
    const subject = new Subject();
    this.uploadAsSubject(name, file, clientTimestamp, subject);
    return subject;
  }

  private uploadAsSubject(name, file, clientTimestamp, subject) {
    const uid = firebase.auth().currentUser.uid;
    const task = firebase.storage().ref(`Orders/${uid}/${clientTimestamp}/${name}`).put(file, {
      contentDisposition: `attachment; filename="${file.name}"`
    });

    if (subject) {
      task.on('state_changed',
        snapshot => {
          const percent = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          subject.next({percent: percent, downloadLink: task.snapshot.downloadURL, isSuccess: task.snapshot.state === 'success'});
        },
        err => subject.error(err),
        () => {
          subject.next({percent: 100, downloadLink: task.snapshot.downloadURL, isSuccess: task.snapshot.state === 'success'});
        }
      );
    } else {
      return Observable.fromPromise(task);
    }
  }

  public getOrderPrice (order: ClientOrder, pricing: Pricing, countSpecialOffers = true): number {
    let price = 0;
    if (order.trial) {
      return price;
    }
    let imagesCount = order.numberOfImages;
    if (imagesCount <= 0 || order.blackAndWhites < 0) {
      return 0;
    }
    if (order.specialOffer && countSpecialOffers) {
      const specialOffer = pricing.SpecialOffers[order.todo][order.specialOffer];
      imagesCount = imagesCount - specialOffer['photos'];
      if (imagesCount < 0) {
        imagesCount = 0;
      }
      price += specialOffer['price'];
    }
    switch (order.todo) {
      case ToDo.ColorCorrection:
        price += imagesCount * pricing.ColorCorrectionPrice;
        break;
      case ToDo.Culling:
        price += imagesCount * pricing.CullingPrice;
        break;
      case ToDo.CullingAndColorCorrection:
        const ccPrice = pricing.CullingColor[order.cullingLeave];
        if (!ccPrice) {
          throw Error('Invalid CullingColor cullingLeave percentage');
        }
        price += imagesCount * ccPrice;
        break;
      case ToDo.Retouching:
        price += imagesCount * pricing.RetouchingPrice;
        break;
      case ToDo.AdvancedRetouching:
        price += imagesCount * pricing.AdvancedRetouchingPrice;
        break;
      case ToDo.PhotoManipulations:
        price += imagesCount * pricing.PhotoManipulationsPrice;
        break;
      case ToDo.BeautyAndEditorial:
        price += imagesCount * pricing.BeautyAndEditorialPrice;
        break;
    }
    if (order.turnaroundTime === TurnaroundTime.Rush) {
      price += price * pricing.RushServicePercentage / 100;
    }
    if (countSpecialOffers) {
      price = Math.min(price, this.getOrderPrice(order, pricing, false));
    }
    return Math.round(price);
  }

  public get pricing$(): Observable<Pricing> {
    return this.db.object('Pricing/Client').map((pricing: Pricing) => {
      Object.keys(pricing.SpecialOffers).forEach((key, index) => {
        pricing.SpecialOffers[key][0] = {name: 'No', value: 0};
      });
      return pricing;
    });
  }

  public getOrderOptions(orderType = 'wedding'): Observable<any> {
    const options = new OrderOptions();

    return this.pricing$.map((pricing: Pricing) => {
      options.weddingOrderTodo = [
        { name: `${ToDo.getNameForCode(ToDo.ColorCorrection)} $${transformCurrency(pricing.ColorCorrectionPrice)}`,
          value: ToDo.ColorCorrection},
        { name: `${ToDo.getNameForCode(ToDo.Culling)} $${transformCurrency(pricing.CullingPrice)}`,
          value: ToDo.Culling},
        { name: ToDo.getNameForCode(ToDo.CullingAndColorCorrection),
          value: ToDo.CullingAndColorCorrection}
      ];

      options.retouchingOrderTodo = [
        {
          name: `${ToDo.getNameForCode(ToDo.Retouching)} ($${transformCurrency(pricing.RetouchingPrice)})`,
          value: ToDo.Retouching
        },
        {
          name: `${ToDo.getNameForCode(ToDo.AdvancedRetouching)} ($${transformCurrency(pricing.AdvancedRetouchingPrice)})`,
          value: ToDo.AdvancedRetouching
        },
        {
          name: `${ToDo.getNameForCode(ToDo.PhotoManipulations)} ($${transformCurrency(pricing.PhotoManipulationsPrice)})`,
          value: ToDo.PhotoManipulations
        },
        {
          name: `${ToDo.getNameForCode(ToDo.BeautyAndEditorial)} ($${transformCurrency(pricing.BeautyAndEditorialPrice)})`,
          value: ToDo.BeautyAndEditorial
        }
      ];

      options.turnaroundTime = [
        {
          name: TurnaroundTime.getNameForCode(
            TurnaroundTime.Standard,
            pricing.TurnaroundTime[orderType][0].from,
            pricing.TurnaroundTime[orderType][0].to),
          value: TurnaroundTime.Standard
        },
        {
          name: TurnaroundTime.getNameForCode(
            TurnaroundTime.Rush,
            pricing.TurnaroundTime[orderType][1].from,
            pricing.TurnaroundTime[orderType][1].to),
          value: TurnaroundTime.Rush
        }
      ];

      options.cullingColor = [];
      Object.keys(pricing.CullingColor).forEach((key, index) => {
        options.cullingColor.push({name: `${CullingColor.getNameForCode(+key)} ($${transformCurrency(pricing.CullingColor[key])})`,
                                   value: +key});
      });

      options.cullingColor = [];
      Object.keys(pricing.CullingColor).forEach((key, index) => {
        options.cullingColor.push({name: `${CullingColor.getNameForCode(+key)} ($${transformCurrency(pricing.CullingColor[key])})`,
                                   value: +key});
      });

      options.pricing = pricing;
      return options;
    });
  }

  public orderSummaryAction(data: Object): Thenable<any> {
    const uid = firebase.auth().currentUser.uid;
    if (uid) {
      data['ts'] = new Date().getTime();
      return this.firebase.database().ref(`Request/ClientOrderApprove/${uid}`).set(data);
    } else {
      return Promise.reject('No uid');
    }
  }

  public checkoutTrial(orderId): Thenable<any> {
    const uid = firebase.auth().currentUser.uid;
    if (uid) {
      return this.firebase.database().ref(`Request/ClientCheckoutTrial/${uid}`).set({orderId: orderId, ts: new Date().getTime()});
    } else {
      return Promise.reject('No uid');
    }
  }

  public orderRemove(orderId): Thenable<any> {
    const uid = firebase.auth().currentUser.uid;
    if (uid) {
      return this.firebase.database().ref(`Request/ClientOrderRemove/${uid}`).set({orderId: orderId, ts: new Date().getTime()});
    } else {
      return Promise.reject('No uid');
    }
  }

  public logOrder(order: any, logSection: string) {
    const uid = firebase.auth().currentUser.uid;
    if (uid) {
      return this.firebase.database().ref(`Logs/${uid}/${logSection}/${new Date().getTime()}`).set(order).then(() => {});
    }
  }
}
