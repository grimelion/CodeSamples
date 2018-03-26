exports.OrderStatus = {
  Pending: 0,
  InProgress: 1,
  Ready: 2,
  Finished: 3,
  Approval: 4,
  InvalidPayment: 5
};

exports.WorkStatus = {
  properties: {
    0: {name: 'Waiting for payment', color: '#d6d6d6'},
    1: {name: 'New', color: '#7CCF00'},
    2: {name: 'Sent to retoucher', color: '#ae5d7f'},
    3: {name: 'In progress', color: '#0CBDE0'},
    4: {name: 'Check', color: '#FF7526'},
    5: {name: 'Ready', color: '#FCD82C'},
    6: {name: 'Sent', color: '#FCD82C'},
    7: {name: 'Additional corrections', color: '#E50000'},
    8: {name: 'Finished', color: '#8f908f'}
  },
  Pending: 0,
  New: 1,
  Assigned: 2,
  InProgress: 3,
  Checking: 4,
  Approval: 5,
  Ready: 6,
  Failure: 7,
  Finished: 8
};

exports.SampleStatus = {
  properties: {
    0: {name: 'In progress', color: '#0CBDE0'},
    1: {name: 'Check', color: '#FF7526'},
    2: {name: 'Ready', color: '#FCD82C'},
    3: {name: 'Approved', color: '#7CCF00'},
    4: {name: 'Sent', color: '#FCD82C'},
    5: {name: 'Additional corrections', color: '#E50000'},
  },
  InProgress: 0,
  Checking: 1,
  Approval: 2,
  Approved: 3,
  Ready: 4,
  AdditionalCorrections: 5
};

exports.ToDo = {
  NotSet: 0,
  ColorCorrection: 1,
  Culling: 2,
  CullingAndColorCorrection: 3,
  Retouching: 4,
  PhotoManipulations: 5,
  AdvancedRetouching: 6,
  BeautyAndEditorial: 7
};

function skipHolidays(timestamp) {
  const oneDay = 24 * 60 * 60 * 1000;
  const day = new Date(timestamp).getDay();
  // if saturday
  if (day == 6) {
    timestamp += 2 * oneDay;
  } else if (day == 0) {
    // if sunday
    timestamp += oneDay;
  } else {
    // add national holidays
  }
  return timestamp;
}

exports.getDeadlineTime = function(timestamp, days, countHolidays) {
  const oneDay = 24 * 60 * 60 * 1000;
  if (!countHolidays) {
    return timestamp + days * oneDay;
  }
  for (let i = 0; i < days; i++) {
    timestamp = skipHolidays(timestamp) + oneDay;
  }
  return skipHolidays(timestamp);
};
