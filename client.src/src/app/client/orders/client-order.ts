import { TurnaroundTime, ToDo } from '../../core/enums';

export class ClientOrder {

  id = '';
  name = '';
  email = '';
  displayName = '';
  type = '';
  // status = '';
  comment = '';
  numberOfImages = 0;
  wantToApprove = false;
  trial = false;
  turnaroundTime = TurnaroundTime.Standard;
  todo = ToDo.NotSet;
  // Wedding specific
  blackAndWhites = 0;
  cullingLeave = 0;
  clientTimestamp = 0;
  specialOffer = 0;
  price = 0;
  crop = 0;

  upload: {
    copying?: any;
    sharing?: any;
    uploading?: any;
    linking?: any;
  };

  description: {
    finalPercentOfImages?: number,
    orderTodoText?: string,
    specialOffer?: string,
    turnaroundTime?: string
  };

  setType(orderType) {
    if (orderType === 'wedding') {
      this.type = orderType;
      this.todo = ToDo.ColorCorrection;
    } else if (orderType === 'retouching') {
      this.type = orderType;
      this.todo = ToDo.Retouching;
    }
  }

  constructor(orderType = '') {
    this.upload = {};
    this.setType(orderType);
  }
}
