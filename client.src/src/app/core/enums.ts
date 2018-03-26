import { ClientOrder } from '../client/orders/client-order';

export class WorkStatus {
  private static properties = {
    0: {name: 'Waiting for payment', color: '#d6d6d6'},
    1: {name: 'New', color: '#7CCF00'},
    2: {name: 'Sent to retoucher', color: '#ae5d7f'},
    3: {name: 'In progress', color: '#0CBDE0'},
    4: {name: 'Check', color: '#FF7526'},
    5: {name: 'Waiting for Approval', nameAdmin: 'Ready', color: '#FCD82C'},
    6: {name: 'Sent', color: '#FCD82C'},
    7: {name: 'Additional corrections', color: '#E50000'},
    8: {name: 'Finished', color: '#8f908f'}
  };

  public static readonly Pending = 0;
  public static readonly New = 1;
  public static readonly Assigned = 2;
  public static readonly InProgress = 3;
  public static readonly Checking = 4;
  public static readonly Approval = 5;
  public static readonly Ready = 6;
  public static readonly Failure = 7;
  public static readonly Finished = 8;

  public static getNameForCode (code: number, alt = false): string {
    const res = this.properties[code];
    if (res) {
      return alt ? res.nameAdmin || res.name : res.name;
    } else {
      return '<unknown status>';
    }
  }

  public static getColorForCode (code: number): string {
    const res = this.properties[code];
    if (res) {
      return res.color;
    } else {
      return '#ccc';
    }
  }
}

export class SampleStatus {
  private static properties = {
    0: {name: 'In progress', color: '#0CBDE0'},
    1: {name: 'Check', color: '#FF7526'},
    2: {name: 'Waiting for Approval', nameAdmin: 'Ready', color: '#FCD82C'},
    3: {name: 'Approved', color: '#7CCF00'},
    4: {name: 'Sent', color: '#FCD82C'},
    5: {name: 'Additional corrections', color: '#E50000'},
  };

  public static readonly InProgress = 0;
  public static readonly Checking = 1;
  public static readonly Approval = 2;
  public static readonly Approved = 3;
  public static readonly Ready = 5;
  public static readonly AdditionalCorrections = 5;

  public static getNameForCode (code: number, alt = false): string {
    const res = this.properties[code];
    if (res) {
      return alt ? res.nameAdmin || res.name : res.name;
    } else {
      return '<unknown status>';
    }
  }

  public static getColorForCode (code: number): string {
    const res = this.properties[code];
    if (res) {
      return res.color;
    } else {
      return '#ccc';
    }
  }
}

export class OrderStatus {
  private static properties = {
    0: {name: 'Waiting for payment', color: '#FCD82C'},
    1: {name: 'In Progress', color: '#0CBDE0'},
    2: {name: 'Ready', color: '#7CCF00'},
    3: {name: 'Finished', color: '#8f908f'},
    4: {name: 'Samples approval', color: '#FF7526'},
    5: {name: 'Invalid Payment', color: '#FCD82C'}
  };

  public static readonly Pending = 0;
  public static readonly InProgress = 1;
  public static readonly Ready = 2;
  public static readonly Finished = 3;
  public static readonly Approval = 4;
  public static readonly InvalidPayment = 5;

  public static getNameForCode (code: number): string {
    const res = this.properties[code];
    if (res) {
      return res.name;
    } else {
      return '<unknown status>';
    }
  }

  public static getColorForCode (code: number): string {
    const res = this.properties[code];
    if (res) {
      return res.color;
    } else {
      return '#ccc';
    }
  }
}

export class TurnaroundTime {

  public static readonly Standard = 0;
  public static readonly Rush = 1;

  public static getNameForCode (code: number, from = 0, to = 0): string {
    if (!code) {
      return `Standard (${from}-${to} business days)`;
    } else {
      return `Rush service (${from || to} business days)`;
    }
  }
}

export class ToDo {
  private static properties = {
    0: {name: ''},
    1: {name: 'Color correction'},
    2: {name: 'Culling'},
    3: {name: 'Culling+Color correction'},
    4: {name: 'Standard retouching'},
    5: {name: 'Photo manipulations'},
    6: {name: 'Advanced retouching'},
    7: {name: 'Beauty and Editorial'}
  };

  public static readonly NotSet = 0;
  public static readonly ColorCorrection = 1;
  public static readonly Culling = 2;
  public static readonly CullingAndColorCorrection = 3;
  public static readonly Retouching = 4;
  public static readonly PhotoManipulations = 5;
  public static readonly AdvancedRetouching = 6;
  public static readonly BeautyAndEditorial = 7;

  public static getNameForCode (code: number): string {
    return this.properties[code].name;
  }
}

export class CullingColor {
  public static getNameForCode (code: number): string {
    const step = 5;
    const lower = code - step;
    const upper = code + step;
    return `Cull ${100 - upper}-${100 - lower}% and CC the remaining ${upper}-${lower}`;
  }
}

export class Pricing {
  ColorCorrectionPrice = 0;
  CullingColor: any;
  CullingPrice = 0;
  PhotoManipulationsPrice = 0;
  RetouchingPrice = 0;
  AdvancedRetouchingPrice = 0;
  BeautyAndEditorialPrice = 0
  RushServicePercentage = 0;
  SpecialOffers: any;
  TurnaroundTime: any;
}

export class OrderOptions {
  pricing: Pricing;
  weddingOrderTodo: { name: string; value: number }[];
  retouchingOrderTodo: { name: string; value: number }[];
  turnaroundTime: { name: string; value: number }[];
  cullingColor: { name: string; value: number }[];
}

export class UploadType {
  private static properties = {
    copying: {name: 'Dropbox copy'},
    sharing: {name: 'Dropbox shared folder'},
    uploading: {name: 'Direct upload'},
    linking: {name: 'link'}
  };
  copying = '';
  sharing = '';
  uploading = '';
  linking = '';

  static getName(type) {
    const res = this.properties[type];
    if (res) {
      return res.name;
    } else {
      return '<unknown>';
    }
  }
}
export function transformCurrency(value: number): number {
  return (value / 100);
}

export class LoadingEvent {
  isLoading: boolean;
  didAction: string;

  constructor(isLoading, didAction) {
    this.isLoading = isLoading;
    this.didAction = didAction;
  }
}
