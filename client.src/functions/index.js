const functions = require('firebase-functions');

const handlers = require('./handlers').handlers;
const enums = require('./enums');
const dropboxService = require('./dropbox-service');
const sender = require('./sender');
const pay = require('./pay');
const hubspot = require('./hubspot');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

/*
 * Helper functions
 */
const DB = admin.database();

const excludeKeys = (object, ignoreKeys)  => {
  return Object.keys(object)
    .filter(key => !ignoreKeys.includes(key))
    .reduce((acc, key) => {
      acc[key] = object[key];
      return acc;
    }, {});
};

exports.processFirebaseDropboxUploads = functions.database.ref('/FirebaseToDropbox/{orderId}')
  .onWrite(event => {
    const data = event.data.val();
    if (!data) {
      console.log('no data');
      return Promise.resolve();
    }
    if (!data.files || !data.files.length) {
      return
    }
    const files = data.files.splice(0, 10);
    if (!files.length) {
      return
    }
    let promise = Promise.resolve();
    files.forEach(function (file) {
      promise = promise.then(() => {
        return dropboxService.urlSave(file.link, data.folderPath + file.name);
      });
    });
    return promise.then(() => {
      console.log(event.params.orderId);
      if (!event.params.orderId) {
        return true;
      }
      return DB.ref('/FirebaseToDropbox').child(event.params.orderId).set({
        folderPath: data.folderPath,
        files: data.files,
      });
    });
  });

exports.processSuperOrders = functions.database.ref('/Orders/Super/{orderId}')
  .onWrite(event => {
    const crnt = event.data.current.val();
    const prev = event.data.previous.val();
    if (!crnt || !prev || !crnt.paidAt) {
      return Promise.resolve('no need to hubspot');
    }
    if (crnt.status === prev.status && crnt.sampleStatus === prev.sampleStatus) {
      return Promise.resolve('no need to hubspot. Identical status');
    }
    if (crnt.dealId) {
      return hubspot.updateDeal(crnt.dealId, crnt);
    } else if (crnt.justPaid) {
      return hubspot.createDeal(crnt).then(dealId => {
        if (!dealId) {
          console.log('no sale manager for paid order');
          return false;
        }
        DB.ref('/Orders/Super').child(event.params.orderId).update({
          dealId: dealId,
          justPaid: false
        })
      })
    }
    return Promise.resolve('no sale manager for paid order')
  });

exports.processModeratorOrders = functions.database.ref('/Orders/Moderator/{moderatorId}/{orderId}')
  .onWrite(event => {
    const data = event.data.val();
    // if (!data || data.status === enums.OrderStatus.Finished) {
    if (!data) {
      DB.ref('/Moderators').child(event.params.moderatorId).child('orders').child(event.params.orderId).remove();
      return Promise.resolve();
    }
    DB.ref('/Moderators').child(event.params.moderatorId).child('orders').child(event.params.orderId).set({
      id: data.id,
      name: data.name,
      displayName: data.displayName,
      status: data.status,
      sampleStatus: data.sampleStatus || 0,
      type: data.type,
      numberOfImages: data.numberOfImages,
      addedAt: data.addedAt,
      deadlineAt: data.deadlineAt,
      retoucherName: data.retoucherName,
      description: data.description,
    });
    return Promise.resolve();
  });

exports.processRetoucherOrders = functions.database.ref('/Orders/Retoucher/{retoucherId}/{orderId}')
  .onWrite(event => {
    const data = event.data.val();
    // if (!data || data.status === enums.OrderStatus.Finished) {
    if (!data) {
      DB.ref('/Retouchers').child(event.params.retoucherId).child('orders').child(event.params.orderId).remove();
      return Promise.resolve();
    }
    DB.ref('/Retouchers').child(event.params.retoucherId).child('orders').child(event.params.orderId).set({
      id: data.id,
      name: data.name,
      status: data.status,
      sampleStatus: data.sampleStatus || 0,
      type: data.type,
      numberOfImages: data.numberOfImages,
      description: data.description,
      retoucherDeadlineAt: data.retoucherDeadlineAt,
    });
    return Promise.resolve();
  });

exports.processMailQueue = functions.database.ref('/MailQueue/{userId}')
  .onWrite(event => {
    const data = event.data.val();
    if (!data) {
      console.log('no data');
      return Promise.resolve();
    }
    return sender.handle(data);
  });

exports.processUsers = functions.database.ref('/Users/{userId}')
  .onWrite(event => {
    const prev = event.data.previous.val();
    const data = event.data.val();
    if (!data) {
      return false;
    }
    if (data.isClient && (!prev || (data.email !== prev.email) || (data.displayName !== prev.displayName))) {
      hubspot.updateUser(prev ? prev.email + ' ' + prev.displayName : data.email + ' ' + data.displayName, data);
    }
    if (!prev || (prev && data.isClient && !prev.isClient)) {
      DB.ref('/Preferences/Notifications').child(event.params.userId).update({
        emailOrderApprove: true,
        emailOrderCreated: true,
        emailOrderReady: true
      });
    }
    const userRef = DB.ref('/Roles').child(event.params.userId);
    return userRef.once('value').then(snapshot => {
      const user = snapshot.val();
      if (!user || !(user.isRetoucher || user.isModerator ||user.isAdmin || user.isSuper)) {
        return false;
      }
      const update = {
        displayName: data.displayName || '',
        email: data.email || '',
        card: data.card || '',
        phone: data.phone || '',
        skype: data.skype || ''
      };
      return userRef.update(update);
    })
  });

exports.processRoles = functions.database.ref('/Roles/{userId}')
  .onWrite(event => {
    const data = event.data.val();
    if (!data) {
      DB.ref('/Retouchers').child(event.params.userId).remove();
      DB.ref('/Moderators').child(event.params.userId).remove();
      DB.ref('/Admins').child(event.params.userId).remove();
      DB.ref('/Users').child(event.params.userId).remove();
      return false;
    }
    const update = {
      displayName: data.displayName || '',
      email: data.email || '',
      card: data.card || '',
      phone: data.phone || '',
      skype: data.skype || ''
    };
    if (data.isRetoucher) {
      DB.ref('/Retouchers').child(event.params.userId).update(update);
    } else {
      DB.ref('/Retouchers').child(event.params.userId).remove();
    }
    if (data.isModerator) {
      DB.ref('/Moderators').child(event.params.userId).update(update);
    } else {
      DB.ref('/Moderators').child(event.params.userId).remove();
    }
    if (data.isAdmin) {
      DB.ref('/Admins').child(event.params.userId).update(update);
    } else {
      DB.ref('/Admins').child(event.params.userId).remove();
    }
    return true;
  });

exports.processOrder = functions.database.ref('/Request/{requestType}/{userId}')
  .onWrite(event => {
    const data = event.data.val();
    if (!data) {
      console.log('no data');
      return Promise.resolve();
    }
    if(event.params.requestType && handlers[event.params.requestType]) {
      console.log('Request: ' +  event.params.requestType);
      return handlers[event.params.requestType](data, event);
    }
    else {
      return Promise.reject('no such request type: ' + event.params.requestType);
    }
  });

exports.setSharing = functions.database.ref('/Users/{userId}/sharing')
  .onWrite(event => {
    const data = event.data.val();
    if (!data) {
      console.log('no data');
      return Promise.resolve();
    }
    return dropboxService.sharingMountFolder(data);
  });

// Used by payment service as callback
exports.payForOrder = functions.https.onRequest((req, res) => {
  const params = req.query;
  if (!parseInt(req.body.item_id_1) > 0) {
    res.sendStatus(200);
    console.log('other order');
    console.log(JSON.stringify(req.body));
    return;
  }
  if (req.body.message_type === 'ORDER_CREATED' && req.body.item_id_1 && req.body.list_currency === 'USD' && req.body.invoice_usd_amount) {
    var price = parseInt((req.body.invoice_usd_amount * 100).toFixed(0));
    console.log(JSON.stringify(req.body));
    return pay.processPayment(req.body.item_id_1, price).then((res) => {
      res.sendStatus(res);
    }).catch(() => res.sendStatus(500));
  } else {
    console.log('invalid 2checkout data');
    res.sendStatus(400);
    return;
  }
});
