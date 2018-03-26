const kue = require('kue');
const queue = kue.createQueue();

function processMessage(userInfo, callback) {
  switch (userInfo.from) {
    case 'morningNotification':
      handleMorningMessage(userInfo.data, callback);
      break;
    case 'dailyNotification':
      handleSchedulerMessage(userInfo.data, callback)
    default:
      callback();
  }
}

function handleMorningMessage(data, callback) {
  console.log(`Good morning: ${data.name}`);
  callback();
}

function handleSchedulerMessage(data, callback) {
  console.log(`Hello, ${data.name}, its ${data.notifyTime}!`)
}

queue.process('NotificationQueue', function(job, done){
  processMessage(job.data, done);
});