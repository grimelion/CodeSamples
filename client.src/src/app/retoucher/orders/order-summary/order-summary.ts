import { TurnaroundTime } from '../../../core/enums';
export class OrderSummary {
  id = '';
  userId = '';
  displayName = '';
  email  = '';
  name = '';
  type = '';
  status = 0;
  sampleStatus = 0;
  // gets augmented on front end
  statusText = '';
  sampleStatusText = '';
  moderatorLink = '';
  description: {
    finalPercentOfImages?: number,
    orderTodoText?: string,
    specialOffer?: string,
    uploadType?: string,
    turnaroundTime?: string
  };
  upload: {
    copying?: any;
    sharing?: any;
    uploading?: any;
    linking?: any;
  };
  blackAndWhites = 0;
  crop = 0;
  wantToApprove = false;
  isApproved = false;
  numberOfImages = 0;
  moderatorComment = '';
  comment = '';
  price = 0;
  retoucherPrice = 0;
  moderatorPrice = 0;
  addedAt = 0;
  deadlineAt = 0;
  retoucherDeadlineAt = 0;
  turnaroundTime = TurnaroundTime.Standard;
  moderatorCorrections = '';
  clientCorrections = '';
  moderatorSamplesCorrections = '';
  clientSamplesCorrections = '';
  retoucherSamplesComment = '';
  retoucherComment = '';
  retoucherLink = '';
  retoucherSamplesLink = '';
  finalLink = '';
  samplesLink = '';
  progressLink = '';
  retoucherId = '';
  retoucherName = '';
  moderatorId = '';
  assignedAdminId = '';
  moderatorName = '';
  sampleColor = '';
  color = '';
  additionalModeratorOrderLink = '';
  additionalModeratorSamplesLink = '';
}
