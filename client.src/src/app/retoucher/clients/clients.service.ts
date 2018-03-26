import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { Query } from 'angularfire2/interfaces';
import 'rxjs/add/operator/take';

@Injectable()
export class ClientsService {

  constructor(private db: AngularFireDatabase) {  }

  public getClients(columnName = '', sortOrder = 'asc'): Observable<any> {
    let clients$;

    const query: Query = { };
    if (columnName) {
      query.orderByChild = columnName;
    } else {
      query.orderByKey = true;
    }
    clients$ = this.db.list('Users/', {
      query: query
    });
    return clients$.map((_users) => {
      const clients = [];
      _users.map((user) => {
        if (user.isClient) {
          if (sortOrder === 'desc') {
            clients.unshift(user);
          } else {
            clients.push(user);
          }
        }
      });
      return clients;
    });
  }

}
