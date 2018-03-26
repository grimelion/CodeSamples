import { NativeDateAdapter } from '@angular/material';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'input'
  },
  display: {
    dateInput: 'input',
    monthYearLabel: {year: 'numeric', month: 'short'},
    dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
    monthYearA11yLabel: {year: 'numeric', month: 'long'},
  },
  // dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  dateInput: 'input',
  monthYearLabel: {year: 'numeric', month: 'short'},
  dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
  monthYearA11yLabel: {year: 'numeric', month: 'long'},
};

export class MyDateAdapter extends NativeDateAdapter {

  private inputRegex = /^([0-9]{2})\/([0-9]{2})\/([0-9]{2}) ([0-9]{2}):([0-9]{2})$/;
  format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${this._to2digit(month)}/${this._to2digit(day)}/${this._to2digit(year)} ${this._to2digit(hours)}:${this._to2digit(minutes)}`;
    } else {
      return date.toDateString();
    }
  }

  private _to2digit(n: number) {
    return ('00' + n).slice(-2);
  }

  parse(value: any): Date | null {
    if (!value) {
      return new Date();
    } else if (value.length === 14) {
      const match = this.inputRegex.exec(value);
      if (match.length === 6) {
        return new Date(
          2000 + parseInt(match[3], 10),
          parseInt(match[1], 10) - 1,
          parseInt(match[2], 10),
          parseInt(match[4], 10),
          parseInt(match[5], 10));
      }
      return new Date();
    }
    // We have no way using the native JS Date to set the parse format or locale, so we ignore these
    // parameters.
    let timestamp = typeof value === 'number' ? value : Date.parse(value);
    return isNaN(timestamp) ? new Date() : new Date(timestamp);
  }
}
