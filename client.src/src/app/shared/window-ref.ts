import { Injectable } from '@angular/core';

@Injectable()
export class WindowRef {
  private openedWindows = [];
  private _replacer: {from: string, to: string};
  getOpenedWindows() {
    return this.openedWindows;
  }
  getLastOpenedWindow() {
    return this.openedWindows.length ? this.openedWindows[this.openedWindows.length - 1] : null;
  }
  set replacer(arg: {from: string, to: string}) {
    this._replacer = arg;
  }
  get replacer() {
    return this._replacer;
  }
  constructor() {
    window['_open'] = window.open; // saving original function
    window['open'] = (url?: string, target?: string, features?: string, replace?: boolean) => {
      if (this.replacer) {
        url = url.replace(this.replacer.from, this.replacer.to);
      }
      const win = window['_open'](url, target, features, replace);
      this.openedWindows.push(win);
      return win;
    };
  }

  getNativeWindow() {
    return window;
  }
}
