const mailgunService = require('./mailgun-service');
const admin = require('firebase-admin');

function handleClient(template, data) {
  return Promise.all([
    admin.database().ref('/Preferences/Notifications').child(data.clientId).once('value').then(snapshot => {
      const notifications = snapshot.val();
      if (!notifications ||
        (!notifications.emailOrderApprove && data.templateId === 'clientOrderApprove') ||
        (!notifications.emailOrderCreated && data.templateId === 'clientOrderCreated') ||
        (!notifications.emailOrderReady && data.templateId === 'clientOrderReady')
      ) {
        return Promise.reject('blocked');
      }
      return true;
    }),
    admin.database().ref('/Users').child(data.clientId).once('value').then(snapshot => {
      const user = snapshot.val();
      if (!user || !user.email) {
        return Promise.reject('invalid user')
      } else {
        return user.email;
      }
    })
  ]).then(res => {
    console.log('about to send an email to client');
    return mailgunService.sendClientEmail(template.from, res[1], template.subject, template.template, data.orderData);
  })
}

function handleModerator(template, data) {
  return admin.database().ref('/Users').child(data.moderatorId).once('value').then(snapshot => {
    const user = snapshot.val();
    if (!user || !user.email) {
      return Promise.reject('invalid user')
    } else {
      return user.email;
    }
  }).then(email => {
    return mailgunService.sendRetoucherEmail(template.from, email, template.subject, template.template, data.orderData);
  });
}

function handleRetoucher(template, data) {
  return admin.database().ref('/Users').child(data.retoucherId).once('value').then(snapshot => {
    const user = snapshot.val();
    if (!user || !user.email) {
      return Promise.reject('invalid user')
    } else {
      return user.email;
    }
  }).then(email => {
    return mailgunService.sendRetoucherEmail(template.from, email, template.subject, template.template, data.orderData);
  })
}

exports.handle = function (data) {
  return admin.database().ref('MailTemplates').child(data.templateId).once('value').then(snapshot => {
    const template = snapshot.val();
    if (!template || !template.enabled) {
      return Promise.resolve('template does not exist or is disabled');
    }
    switch (data.type) {
      case 'client':
        return handleClient(template, data);
        break;
      case 'moderator':
        return handleModerator(template, data);
        break;
      case 'retoucher':
        return handleRetoucher(template, data);
        break;
    }
    return Promise.reject('unknown data type');
  })
};

exports.sendToClient = function (senderId, clientId, templateId, orderData) {
  admin.database().ref('MailQueue').child(senderId).set({
    type: 'client',
    clientId: clientId,
    templateId: templateId,
    orderData: orderData
  });
};

exports.sendToRetoucher = function (senderId, retoucherId, templateId, orderData) {
  admin.database().ref('MailQueue').child(senderId).set({
    type: 'retoucher',
    retoucherId: retoucherId,
    templateId: templateId,
    orderData: orderData
  });
};

exports.sendToModerator = function (senderId, moderatorId, templateId, orderData) {
  admin.database().ref('MailQueue').child(senderId).set({
    type: 'moderator',
    moderatorId: moderatorId,
    templateId: templateId,
    orderData: orderData
  });
};
