/* tslint:disable:component-selector */

import {
  Component, OnInit, Input, ContentChild, ElementRef, AfterViewInit, Output, EventEmitter,
  OnDestroy, Renderer
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { FilterDialog } from './dialogs/filter.dialog';
import { MdDialogRef, MdDialogConfig, MdDialog } from '@angular/material';
import { StorageService } from '../../shared/storage.service';
import { environment } from '../../../environments/environment';
import 'rxjs/add/operator/toPromise';

class SortParams {
  order = '';
  icon = 'sort';
  color = '';

  setAsc() {
    this.icon = 'caret-down';
    this.order = 'asc';
    this.color = 'accent';
  }

  setDesc() {
    this.icon = 'caret-up';
    this.order = 'desc';
    this.color = 'accent';
  }

  toggle() {
    if (this.order === 'asc') {
      this.setDesc();
    } else {
      this.setAsc();
    }
  }
}

export class ColumnHeader {
  id: number;
  name: string;
  value: string;
  sortable: boolean;
  enabled: boolean;
  alwaysShown: boolean;
  width: number;
  constructor(obj: {name: string, value: string, sortable: boolean, enabled: boolean, alwaysShown: boolean, width: number} = null) {
    if (obj) {
      this.name = obj.name;
      this.value = obj.value;
      this.sortable = obj.sortable;
      this.enabled = obj.enabled;
      this.alwaysShown = obj.alwaysShown;
      this.width = obj.width;
    }
  }
}

export class SortEvent {
  columnName: string;
  sortOrder: string;
  constructor(columnName: string, sortOrder: string) {
    this.columnName = columnName;
    this.sortOrder = sortOrder;
  }
}

@Component({
  selector: 'table [appSortableTable]',
  templateUrl: 'sortable-table.component.html',
  styleUrls: ['sortable-table.component.scss']
})
export class SortableTableComponent implements OnInit {

  private headerSubscriptions: Subscription[];
  private filterDialog: MdDialogRef<FilterDialog>;
  private _tableName = 'default';

  public _columns = [];

  @ContentChild(SortableTableComponent)
  element: any;

  // Keep track on chosen column
  public sortColumn = -1;

  @Input('columns')
  set columns(columns: any[]) {
    let i = 0;
    columns.forEach(column => {
      column.id = i++;
      column.sort = new SortParams();
    });
    this._columns = columns;
  }

  @Input('tableName')
  set tableName(tableName: string) {
    this._tableName = tableName;
  }

  @Output('sort')
  sort: EventEmitter<SortEvent> = new EventEmitter<SortEvent>();

  constructor(private storageService: StorageService,
              public dialog: MdDialog,
              public elementRef: ElementRef,
              private renderer: Renderer) { }

  ngOnInit() {
    let i = 0;
    this._columns.forEach(column => column.id = i++);
    const storedColumns = this.storageService.getObjectFromLocalStorage(environment.filterStoragePrefix + this._tableName);
    if (storedColumns && storedColumns.length && storedColumns.length === this._columns.length) {
      storedColumns.forEach(storedColumn => {
        const column = this._columns[storedColumn.id];
        if (!column.alwaysShown) {
          this._columns[storedColumn.id].enabled = storedColumn.enabled;
        }
      });
    }
    this.refreshHiddenColumns();
  }

  public toggleSort(column) {
    if (this.sortColumn === column.id) {
      column.sort.toggle();
    } else {
      if (this.sortColumn !== -1) {
        this._columns[this.sortColumn].sort = new SortParams();
      }
      this.sortColumn = column.id;
      column.sort.setAsc();
    }
    this.sort.emit(new SortEvent(column.value, column.sort.order));
  }

  public openFilter() {
    this.filterDialog = this.dialog.open(FilterDialog, new MdDialogConfig());
    this.filterDialog.componentInstance.columns = this._columns;
    this.filterDialog.componentInstance.tableName = this._tableName;
    this.filterDialog.afterClosed().toPromise().then(() => {
      this.refreshHiddenColumns();
    });
  }

  private refreshHiddenColumns() {
    const storedColumns = this.storageService.getObjectFromLocalStorage(environment.filterStoragePrefix + this._tableName);
    if (storedColumns) {
      storedColumns.forEach(c => {
        const cClass = 'hide-' + c.id;
        this.renderer.setElementClass(this.elementRef.nativeElement, cClass, !c.enabled);
      });
    }
  }
}
