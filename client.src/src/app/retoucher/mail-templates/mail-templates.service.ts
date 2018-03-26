import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Query } from 'angularfire2/interfaces';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase';

@Injectable()
export class MailTemplatesService {
  constructor(private db: AngularFireDatabase) {  }

  public getMailTemplates(columnName = '', sortOrder = 'asc'): Observable<any> {
    let templates$;

    const query: Query = { };
    if (columnName) {
      query.orderByChild = columnName;
    } else {
      query.orderByKey = true;
    }
    templates$ = this.db.list('MailTemplates', {
      query: query
    });
    return templates$.map((_templates) => {
      const templates = [];
      _templates.map((template) => {
        template.enabledText = template.enabled ? 'Enabled' : 'Disabled';
        if (sortOrder === 'desc') {
          templates.unshift(template);
        } else {
          templates.push(template);
        }
      });
      return templates;
    });
  }

  public getMailTemplate(id: string): Observable<any> {
    return this.db.object('MailTemplates/' + id);
  }

  public saveMailTemplate(id: string, data) {
    firebase.database().ref(`MailTemplates/${id}`).update(data);
  }
}
