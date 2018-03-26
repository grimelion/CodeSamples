const enums = require('./enums');
const admin = require('firebase-admin');
const sender = require('./sender');
const mainOps = require('./mainOps');

exports.processPayment = function (orderKey, price, isSuper) {
  const orderRef = mainOps.getOrder(orderKey);
  return orderRef.once('value').then(snapshot => {
    const order = snapshot.val();
    if (!order) {
      console.log('Order with specified orderKey not found');
      return Promise.resolve(404);
    } else if (!isSuper) {
      if (order.status !== enums.WorkStatus.Pending) {
        console.log('Payment received already');
        return Promise.resolve(200);
      } else if (order.price !== price) {
        console.log('Invalid price! ' + price);
        mainOps.getClientOrder(order.userId, orderKey).update({
          status: enums.OrderStatus.InvalidPayment
        });
        return Promise.resolve(200);
      }
    }
    const update = {
      status: enums.OrderStatus.InProgress
    };
    mainOps.getClientOrder(order.userId, orderKey).update(update);
    // augment with moderator-only visible data
    update.status = enums.WorkStatus.New;
    update.paidAt = new Date().getTime();
    update.justPaid = true;
    mainOps.getAdminOrder(order.assignedAdminId, order.id).update(update);
    orderRef.update(update);
    console.log('Payment success');
    sender.sendToModerator(order.userId, order.assignedAdminId, 'adminNewOrder', order);
    return Promise.resolve(200);
  }).catch(errorObject => {
    console.log("The read failed: " + errorObject.code);
    return Promise.reject(500);
  });
};
