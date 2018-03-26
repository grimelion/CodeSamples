import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { Query } from 'angularfire2/interfaces';
import 'rxjs/add/operator/take';
import { combineLatest } from 'rxjs/observable/combineLatest';

@Injectable()
export class RetouchersService {

  constructor(private db: AngularFireDatabase) {  }

  public _getRetouchers(columnName = '', sortOrder = 'asc', role): Observable<any> {
    let $retouchers;

    const query: Query = { };
    if (columnName) {
      query.orderByChild = columnName;
    } else {
      query.orderByKey = true;
    }
    $retouchers = this.db.list(role + 's/', {
      query: query
    });
    return $retouchers.map((_retouchers) => {
      const retouchers = [];
      _retouchers.map((retoucher) => {
        if (sortOrder === 'desc') {
          retouchers.unshift(retoucher);
        } else {
          retouchers.push(retoucher);
        }
      });
      return retouchers;
    });
  }

  public getRetouchers(columnName = '', sortOrder = 'asc'): Observable<any> {
    return this._getRetouchers(columnName, sortOrder, 'Retoucher');
  }

  public getModerators(columnName = '', sortOrder = 'asc'): Observable<any> {
    return this._getRetouchers(columnName, sortOrder, 'Moderator');
  }

}
