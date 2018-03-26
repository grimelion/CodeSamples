export class Notifications {

  emailOrderCreated: boolean;
  emailOrderApprove: boolean;
  emailOrderReady: boolean;

  constructor(setAll = false) {
    this.emailOrderCreated = setAll;
    this.emailOrderApprove = setAll;
    this.emailOrderReady = setAll;
  }
}
