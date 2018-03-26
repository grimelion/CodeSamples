import { Injectable } from '@angular/core';
import { WindowRef } from './window-ref';
import { MemoryStorage } from './memory-storage';

@Injectable()
export class StorageService {

  private _localStorage;

  get localStorage() {
    return this._localStorage;
  };

  public getObjectFromLocalStorage(key: string): any {
    try {
      return JSON.parse(this.localStorage.getItem(key));
    } catch (e) {
      return null;
    }
  }

  public setObjectToLocalStorage(key: string, data: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  private storageAvailable(type) {
    try {
      const storage = <any>this.windowRef.getNativeWindow()[type],
        x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  };

  constructor(private windowRef: WindowRef) {
    if (this.storageAvailable('localStorage')) {
      this._localStorage = this.windowRef.getNativeWindow().localStorage;
    } else {
      this._localStorage = new MemoryStorage();
    }
  }

}
