import { TurnaroundTime } from '../../core/enums';
export class OrderSummary {
  id = '';
  name = '';
  type = '';
  upload = '';
  status = 0;
  // gets augmented on front end
  statusText = '';
  description: {
    finalPercentOfImages?: number,
    orderTodoText?: string,
    specialOffer?: string,
    turnaroundTime?: string
  };
  blackAndWhites = 0;
  crop = 0;
  wantToApprove = false;
  numberOfImages = 0;
  comment = '';
  price = 0;
  turnaroundTime = TurnaroundTime.Standard;
  finalLink = '';
  samplesLink = '';
  addedAt = 0;
  deadlineAt = 0;
}
