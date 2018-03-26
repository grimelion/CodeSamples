import { TurnaroundTime } from '../../../../core/enums';
export class RetoucherSummary {
  id = '';
  name = '';
  type = '';
  status = 0;
  sampleStatus = 0;
  // gets augmented on front end
  statusText = '';
  sampleStatusText = '';
  moderatorLink = '';
  retoucherComment = '';
  retoucherLink = '';
  retoucherSamplesLink = '';
  isRemote = 0;
  description: {
    finalPercentOfImages?: number,
    orderTodoText?: string,
    specialOffer?: string
  };
  upload: {
    copying?: any;
    sharing?: any;
    uploading?: any;
    linking?: any;
  };
  blackAndWhites = 0;
  wantToApprove = false;
  isApproved = false;
  numberOfImages = 0;
  comment = '';
  turnaroundTime = TurnaroundTime.Standard;
  moderatorCorrections = '';
  moderatorSamplesCorrections = '';
  retoucherSamplesComment = '';
  sampleColor = '';
  color = '';
  additionalModeratorOrderLink = '';
  additionalModeratorSamplesLink = '';
}
