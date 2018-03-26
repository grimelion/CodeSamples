/* tslint:disable:component-class-suffix */
import { Component, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MdDialogRef, MdDialogConfig } from '@angular/material';
import { StorageService } from '../../../shared/storage.service';
import { ColumnHeader } from '../sortable-table.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-filter-dialog',
  templateUrl: 'filter.dialog.html',
  styles: [':host {}']
})
export class FilterDialog implements OnDestroy {

  // Required
  public tableName: string;

  // Required
  public columns: ColumnHeader[];

  constructor(public dialogRef: MdDialogRef<FilterDialog>, private storageService: StorageService) {  }

  ngOnDestroy() {
    const key = environment.filterStoragePrefix + this.tableName;
    const result = this.storageService.setObjectToLocalStorage(key, this.columns.map(column => {
      return {id: column.id, enabled: column.enabled};
    }));
    this.dialogRef.close(result);
  }
}
