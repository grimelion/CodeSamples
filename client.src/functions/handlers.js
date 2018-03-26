const enums = require('./enums');
const admin = require('firebase-admin');
const dropboxService = require('./dropbox-service');
const pay = require('./pay');
const sender = require('./sender');
const mainOps = require('./mainOps');

const gcs = require('@google-cloud/storage')();

function getFolderName(orderData) {
  return (orderData.name).replace(/[^a-zA-Z0-9-_ ()]/g, '') + ` (#${orderData.id})`;
}

function removeUpload(orderData) {
  if (orderData.upload.uploading && orderData.upload.uploading.folder) {
    const bucket = gcs.bucket('canoes-b0901.appspot.com');
    bucket.deleteFiles({ prefix: orderData.upload.uploading.folder + '/'}, function(err) { console.log(err) });
  }
  const orderFolderName = getFolderName(orderData);
  if (!orderData.orderLink) {
    return;
  }
  const folderPath = `/Clients/${orderData.displayName || orderData.email}/${orderFolderName}`;
  dropboxService.filesDelete(folderPath);
}
function handleUpload(orderData) {
  const orderFolderName = getFolderName(orderData);
  const folderPath = `/Clients/${orderData.displayName || orderData.email}/${orderFolderName}`;
  const copiedToLink = `https://www.dropbox.com/home/Clients/${encodeURIComponent(orderData.displayName || orderData.email)}`;
  if (!orderData.upload) {
    return
  }
  if (orderData.upload.copying) {
    dropboxService.filesCopyReferenceSave(orderData.upload.copying.copyId, folderPath + '/Files');
    orderData.upload.copying.copiedToLink = copiedToLink;
  } else if (orderData.upload.linking) {
    orderData.upload.linking.copiedToLink = copiedToLink;
  } else if (orderData.upload.uploading) {
    orderData.upload.uploading.copiedToLink = copiedToLink;
  }
  return Promise.resolve(true);
}

function getOrderPrice(order, pricing, countSpecialOffers = true) {
  let price = 0;
  if (order.trial) {
    return price;
  }
  let imagesCount = order.numberOfImages;
  if (imagesCount <= 0 || order.blackAndWhites < 0) {
    return 0;
  }
  if (countSpecialOffers && order.specialOffer) {
    const specialOffer = pricing.SpecialOffers[order.todo][order.specialOffer];
    imagesCount = imagesCount - specialOffer['photos'];
    if (imagesCount < 0) {
      imagesCount = 0;
    }
    price += specialOffer['price'];
  }
  switch (order.todo) {
    case enums.ToDo.ColorCorrection:
      price += imagesCount * pricing.ColorCorrectionPrice;
      break;
    case enums.ToDo.Culling:
      price += imagesCount * pricing.CullingPrice;
      break;
    case enums.ToDo.CullingAndColorCorrection:
      const ccPrice = pricing.CullingColor[order.cullingLeave];
      if (!ccPrice) {
        throw Error('Invalid CullingColor cullingLeave percentage');
      }
      price += imagesCount * ccPrice;
      break;
    case enums.ToDo.Retouching:
      price += imagesCount * pricing.RetouchingPrice;
      break;
    case enums.ToDo.AdvancedRetouching:
      price += imagesCount * pricing.AdvancedRetouchingPrice;
      break;
    case enums.ToDo.PhotoManipulations:
      price += imagesCount * pricing.PhotoManipulationsPrice;
      break;
    case enums.ToDo.BeautyAndEditorial:
      price += imagesCount * pricing.BeautyAndEditorialPrice;
      break;
  }
  if (order.turnaroundTime) {
    price += price * pricing.RushServicePercentage / 100;
  }
  if (countSpecialOffers) {
    price = Math.min(price, getOrderPrice(order, pricing, false));
  }
  console.log(`Price: ${price}`);
  return Math.round(price);
}

function validateOrderPrice(order, event) {
  return Promise.all([
    admin.database().ref('SpecialOffers/Trial/' + event.params.userId).once('value'),
    admin.database().ref('Pricing').once('value')]
  ).then(values => {
    if (!order.numberOfImages) {
      return Promise.reject('Number of images can not be 0');
    }
    const trial = values[0].val();
    const pricing = values[1].val();
    const clientPricing = pricing.Client;
    const moderatorPricing = pricing.Moderator;
    const retoucherPricing = pricing.Retoucher;
    if (order.trial) {
      if (trial) {
        return Promise.reject('trial already used');
      }
      if (order.blackAndWhites || order.cullingLeave || order.turnaroundTime || order.specialOffer || order.wantToApprove) {
        return Promise.reject('invalid trial params blackAndWhites || cullingLeave || turnaroundTime || specialOffer || wantToApprove');
      }
      if (order.type === 'wedding' && (order.todo !== enums.ToDo.ColorCorrection || order.numberOfImages !== 5)) {
        return Promise.reject('invalid trial wedding order');
      }
      if (order.type === 'retouching' && (order.todo !== enums.ToDo.Retouching || order.numberOfImages !== 1)) {
        return Promise.reject('invalid trial retouching order');
      }
    }
    if (getOrderPrice(order, clientPricing) === order.price) {
      return Promise.resolve(
        {
          orderPrice: order.price,
          moderatorPrice: getOrderPrice(order, moderatorPricing, false),
          retoucherPrice: getOrderPrice(order, retoucherPricing, false),
          pricing: clientPricing
        });
    } else {
      return Promise.reject('Invalid price')
    }
  })
}

// Client creates order
function ClientOrderHandler(data, event) {
  const orderData = data;
  orderData.status = enums.OrderStatus.Pending;
  orderData.addedAt = new Date().getTime();
  let orderKey = 0;
  const orderNumberRef = admin.database().ref('/FlowConfig').child('orderNumber');
  return orderNumberRef.transaction((orderNumber) => {
    orderKey = (orderNumber || 0) + Math.floor(Math.random() * (8 - 2)) + 2;
    return orderKey;
  }).then(() => {
    orderData.id = orderKey;
    return validateOrderPrice(orderData, event).then(priceObj => {
      return handleUpload(orderData).then(res => {
        mainOps.getClientOrder(event.params.userId, orderKey).set(orderData);
        // augment with moderator-only visible data
        if (!orderData.wantToApprove) {
          orderData.isApproved = true;
        }
        orderData.userId = event.params.userId;
        orderData.status = enums.WorkStatus.Pending;
        orderData.retoucherPrice = priceObj.retoucherPrice;
        orderData.moderatorPrice = priceObj.moderatorPrice;
        orderData.deadlineAt = enums.getDeadlineTime(orderData.addedAt,
          priceObj.pricing.TurnaroundTime[orderData.type][orderData.turnaroundTime].to ||
          priceObj.pricing.TurnaroundTime[orderData.type][orderData.turnaroundTime].from, true);
        orderData.retoucherDeadlineAt = enums.getDeadlineTime(orderData.addedAt,
          priceObj.pricing.TurnaroundTime[orderData.type][orderData.turnaroundTime].retoucherTo ||
          priceObj.pricing.TurnaroundTime[orderData.type][orderData.turnaroundTime].retoucherFrom, false);
        // if order was trial - set "no more trials"
        if (orderData.trial) {
          admin.database().ref('SpecialOffers/Trial/' + event.params.userId).set(true);
        }
        sender.sendToClient(event.params.userId, orderData.userId, 'clientOrderCreated', orderData);
        return Promise.all([
          admin.database().ref('/SuperClientData').child(event.params.userId).once('value'),
          mainOps.getDefaultAdmin().once('value')
          ]
        ).then(res => {
          const adminClientData = res[0].val() || {};
          orderData.assignedAdminId = adminClientData.assignedAdminId || res[1].val();
          orderData.assignedModeratorId = adminClientData.assignedModeratorId || '';
          mainOps.getOrder(orderKey).set(orderData);
          // Remove price information
          delete orderData.price;
          delete orderData.retoucherPrice;
          delete orderData.moderatorPrice;
          delete orderData.description.specialOffer;
          mainOps.getAdminOrder(orderData.assignedAdminId, orderKey).set(orderData);
        });
      });
    });
  });
}

// Client removes order (works only if pending)
function ClientOrderRemoveHandler(data, event) {
  const orderData = data;
  if (!data.orderId) {
    return Promise.reject('Bad request');
  }
  const clientOrderRef = mainOps.getClientOrder(event.params.userId, data.orderId);
  return clientOrderRef.once('value').then(snapshot => {
    const order = snapshot.val();
    if (!order) {
      return Promise.reject('order not found');
    } else if (order.status !== enums.OrderStatus.Pending) {
      return Promise.reject('Invalid status');
    }
    removeUpload(order);
    clientOrderRef.remove();
    mainOps.getOrder(order.id).remove();
    mainOps.getAdminOrder(order.assignedAdminId, order.id).remove();
    return Promise.resolve();
  });
}

// Client approves order
function ClientOrderApproveHandler(data, event) {
  if (!data.orderId) {
    return Promise.reject('Bad request');
  }
  const orderRef = mainOps.getOrder(data.orderId);
  return orderRef.once('value').then(snapshot => {
    const order = snapshot.val();
    if (!order) {
      return Promise.reject('order not found');
    } else if (![enums.WorkStatus.New, enums.WorkStatus.Assigned, enums.WorkStatus.InProgress, enums.WorkStatus.Checking, enums.WorkStatus.Approval, enums.WorkStatus.Failure, enums.WorkStatus.Ready].includes(order.status)) {
      return Promise.reject('Invalid status');
    }
    const update = {};
    const clientOrderRef = mainOps.getClientOrder(order.userId, data.orderId);
    const retoucherOrderRef = mainOps.getRetoucherOrder(order.retoucherId, data.orderId);
    if (!order.isApproved) {
      update.clientSamplesCorrections = data.comment || '';
      order.isOrder = true;
      if (data.isApproved) {
        update.sampleStatus = enums.SampleStatus.Approved;
        update.isApproved = true;
        retoucherOrderRef.update({
          sampleStatus: enums.SampleStatus.Approved,
          isApproved: true
        });
        sender.sendToModerator(event.params.userId, order.assignedAdminId, 'adminClientApproved', order);
        sender.sendToModerator(event.params.userId, order.moderatorId, 'moderatorOrderApproved', order);
        sender.sendToRetoucher(event.params.userId, order.retoucherId, 'retoucherOrderApproved', order);
      } else {
        update.sampleStatus = enums.SampleStatus.AdditionalCorrections;
        sender.sendToModerator(event.params.userId, order.assignedAdminId, 'adminClientAdditionalCorrections', order);
        sender.sendToModerator(event.params.userId, order.moderatorId, 'moderatorAdditionalCorrections', order);
      }
      clientOrderRef.update({
        status: enums.OrderStatus.InProgress
      });
    } else {
      update.clientCorrections = data.comment || '';
      order.isSamples = true;
      if (data.isApproved) {
        update.status = enums.WorkStatus.Finished;
        retoucherOrderRef.update({
          status: enums.WorkStatus.Finished
        });
        clientOrderRef.update({
          status: enums.OrderStatus.Finished
        });
        sender.sendToModerator(event.params.userId, order.assignedAdminId, 'adminClientApproved', order);
        sender.sendToModerator(event.params.userId, order.moderatorId, 'moderatorOrderApproved', order);
        sender.sendToRetoucher(event.params.userId, order.retoucherId, 'retoucherOrderApproved', order);
      } else {
        update.status = enums.WorkStatus.Failure;
        clientOrderRef.update({
          status: enums.OrderStatus.InProgress
        });
        sender.sendToModerator(event.params.userId, order.assignedAdminId, 'adminClientAdditionalCorrections', order);
        sender.sendToModerator(event.params.userId, order.moderatorId, 'moderatorAdditionalCorrections', order);
      }
    }
    orderRef.update(update);
    mainOps.getAdminOrder(order.assignedAdminId, order.id).update(update);
    mainOps.getModeratorOrder(order.moderatorId, order.id).update(update);
    return Promise.resolve();
  });
}

// Client confirms trial order
function ClientCheckoutTrialHandler(data, event) {
  const orderData = data;
  if (!data.orderId) {
    return Promise.reject('Bad request');
  }
  return pay.processPayment(data.orderId, 0, false);
}

// Moderator sets client profile for retoucher and for internal use
function ModeratorSetClientProfileHandler(data, event) {
  if (!data.clientId) {
    return Promise.reject('Bad request');
  }
  admin.database().ref('/PrivateClientData').child(data.clientId).update({
    internalInfo: data.internalInfo || '',
    assignedRetoucher: data.assignedRetoucher || {}
  });
  admin.database().ref('/PublicClientData').child(data.clientId).update({
    retoucherComment: data.retoucherComment || ''
  });
  return Promise.resolve();
}

function AdminUpdateOrderDatesHandler(data, event) {
  const orderData = data;
  if (!data.orderId || !data.retoucherDeadlineAt || !data.deadlineAt) {
    return Promise.reject('Bad request');
  }
  const orderRef = mainOps.getOrder(data.orderId);
  return orderRef.once('value').then(snapshot => {
    const order = snapshot.val();
    if (!order) {
      return Promise.reject('order not found');
    } else if (order.status === enums.WorkStatus.Finished) {
      return Promise.reject('Invalid status');
    }
    mainOps.getClientOrder(order.userId, data.orderId).update({deadlineAt: data.deadlineAt});
    if (order.retoucherId) {
      mainOps.getRetoucherOrder(order.retoucherId, data.orderId).update({retoucherDeadlineAt: data.retoucherDeadlineAt});
    }
    const update = {deadlineAt: data.deadlineAt, retoucherDeadlineAt: data.retoucherDeadlineAt};
    if (order.moderatorId) {
      mainOps.getModeratorOrder(order.moderatorId, data.orderId).update(update);
    }
    orderRef.update(update);
    mainOps.getAdminOrder(order.assignedAdminId, order.id).update(update);
    return Promise.resolve();
  });
}

function SuperUpdateOrderPriceHandler(data, event) {
  if (!data.orderId) {
    return Promise.reject('Bad request');
  }
  const orderRef = mainOps.getOrder(data.orderId);
  return orderRef.once('value').then(snapshot => {
    const order = snapshot.val();
    if (!order) {
      return Promise.reject('order not found');
    } else if (order.status === enums.WorkStatus.Finished) {
      return Promise.reject('Invalid status');
    }
    let retoucherPrice;
    let moderatorPrice;
    try {
      retoucherPrice = parseInt((data.retoucherPrice * 100).toFixed());
      moderatorPrice = parseInt((data.moderatorPrice * 100).toFixed());
    } catch(err) { retoucherPrice = 0; moderatorPrice = 0;}
    if (order.retoucherId) {
      mainOps.getRetoucherOrder(order.retoucherId, data.orderId).update({retoucherPrice: retoucherPrice});
    }
    if (order.moderatorId) {
      mainOps.getModeratorOrder(order.moderatorId, data.orderId).update({moderatorPrice: moderatorPrice});
    }
    const update = {moderatorPrice: moderatorPrice, retoucherPrice: retoucherPrice};
    orderRef.update(update);
    return Promise.resolve();
  });
}

function SuperAssignOrderAdminHandler(data, event) {
  if (!data.orderId || !data.adminId) {
    return Promise.reject('Bad request');
  }
  const orderRef = mainOps.getOrder(data.orderId);
  return orderRef.once('value').then(snapshot => {
    const mainOrder = snapshot.val();
    if (!mainOrder) {
      return Promise.reject('order not found');
    } else if (mainOrder.status === enums.WorkStatus.Finished) {
      return Promise.reject('Invalid status');
    } else if (mainOrder.assignedAdminId === data.adminId) {
      return Promise.resolve('Same admin');
    }
    const adminOrderRef = mainOps.getAdminOrder(mainOrder.assignedAdminId, data.orderId);
    return adminOrderRef.once('value').then(snapshot => {
      const order = snapshot.val();
      if (!order) {
        return Promise.reject('order not found');
      }
      orderRef.update({assignedAdminId: data.adminId});
      mainOps.getAdminOrder(data.adminId, data.orderId).set(order);
      adminOrderRef.remove();
    });
  });
}

// Moderator
function ModeratorOrderApproveHandler(data, event) {
  if (!data.orderId) {
    return Promise.reject('Bad request');
  }
  const orderRef = mainOps.getOrder(data.orderId);
  return orderRef.once('value').then(snapshot => {
    const order = snapshot.val();
    if (!order) {
      return Promise.reject('order not found');
    } else if (![enums.WorkStatus.InProgress, enums.WorkStatus.Checking, enums.WorkStatus.Approval, enums.WorkStatus.Failure, enums.WorkStatus.Ready].includes(order.status)) {
      return Promise.reject('Invalid status');
    }
    const retoucherOrderRef = mainOps.getRetoucherOrder(order.retoucherId, data.orderId);
    const moderatorOrderRef = mainOps.getModeratorOrder(order.moderatorId, order.id);
    const update = {
      additionalModeratorOrderLink: data.additionalModeratorOrderLink || '',
      additionalModeratorSamplesLink: data.additionalModeratorSamplesLink || ''
    };
    if (!order.isApproved) {
      update.moderatorSamplesCorrections = data.comment || '';
      if (data.isApproved) {
        update.sampleStatus = enums.SampleStatus.Approval;
        retoucherOrderRef.update(update);
        moderatorOrderRef.update({
          sampleStatus: enums.SampleStatus.Approval,
          moderatorSamplesCorrections: update.moderatorSamplesCorrections
        });
        sender.sendToModerator(event.params.userId, order.assignedAdminId, 'adminSamplesReady', order);
      } else {
        update.sampleStatus = enums.SampleStatus.AdditionalCorrections;
        retoucherOrderRef.update({
          sampleStatus: enums.SampleStatus.AdditionalCorrections,
          moderatorSamplesCorrections: update.moderatorSamplesCorrections,
          additionalModeratorSamplesLink: update.additionalModeratorSamplesLink
        });
        moderatorOrderRef.update({
          sampleStatus: enums.SampleStatus.InProgress,
          moderatorSamplesCorrections: update.moderatorSamplesCorrections,
          additionalModeratorSamplesLink: update.additionalModeratorSamplesLink
        });
        order.moderatorSamplesCorrections = update.moderatorSamplesCorrections;
        sender.sendToRetoucher(event.params.userId, order.retoucherId, 'retoucherAdditionalCorrections', order);
      }
    } else {
      update.moderatorCorrections = data.comment || '';
      if (data.isApproved) {
        update.status = enums.WorkStatus.Approval;
        moderatorOrderRef.update({
          status: enums.WorkStatus.Approval,
          moderatorCorrections: update.moderatorCorrections
        });
        sender.sendToModerator(event.params.userId, order.assignedAdminId, 'adminOrderReady', order);
      } else {
        update.status = enums.WorkStatus.Failure;
        retoucherOrderRef.update({
          status: enums.WorkStatus.Failure,
          moderatorCorrections: update.moderatorCorrections,
          additionalModeratorOrderLink: update.additionalModeratorOrderLink
        });
        moderatorOrderRef.update({
          status: enums.WorkStatus.InProgress,
          moderatorCorrections: update.moderatorCorrections,
          additionalModeratorOrderLink: update.additionalModeratorOrderLink
        });
        order.moderatorCorrections = update.moderatorCorrections;
        sender.sendToRetoucher(event.params.userId, order.retoucherId, 'retoucherAdditionalCorrections', order);
      }
    }
    orderRef.update(update);
    mainOps.getAdminOrder(order.assignedAdminId, order.id).update(update);
    return Promise.resolve();
  });
}

// Moderator removes order (works only if pending)
function AdminRemoveOrderHandler(data, event) {
  const orderData = data;
  if (!data.orderId) {
    return Promise.reject('Bad request');
  }
  const orderRef = mainOps.getOrder(data.orderId);
  return orderRef.once('value').then(snapshot => {
    const order = snapshot.val();
    if (!order) {
      return Promise.reject('order not found');
    } else if (order.status !== enums.WorkStatus.Pending) {
      return Promise.reject('Invalid status');
    }
    removeUpload(order);
    mainOps.getClientOrder(order.userId, data.orderId).remove();
    orderRef.remove();
    mainOps.getAdminOrder(order.assignedAdminId, order.id).remove();
    if (order.retoucherId) {
      mainOps.getModeratorOrder(order.moderatorId, order.id).remove();
    }
    if (order.retoucherId) {
      mainOps.getRetoucherOrder(order.retoucherId, order.id).remove();
    }
    return Promise.resolve();
  });
}

// Moderator removes firebase files and client links
function AdminRemoveFilesHandler(data, event) {
  const orderData = data;
  if (!data.orderId) {
    return Promise.reject('Bad request');
  }
  const orderRef = mainOps.getOrder(data.orderId);
  return orderRef.once('value').then(snapshot => {
    const order = snapshot.val();
    if (!order) {
      return Promise.reject('order not found');
    } else if (![enums.WorkStatus.Finished, enums.WorkStatus.Ready].includes(order.status)) {
      return Promise.reject('Order status must be finished!');
    }

    const update = {upload: {}};
    if (order.status === enums.WorkStatus.Ready) {
      update.status = enums.WorkStatus.Finished;
      mainOps.getClientOrder(order.userId, data.orderId).update({
        finalLink: '',
        samplesLink: '',
        status: enums.OrderStatus.Finished
      });
    } else {
      mainOps.getClientOrder(order.userId, data.orderId).update({
        finalLink: '',
        samplesLink: ''
      });
    }
    orderRef.update(update);
    mainOps.getAdminOrder(order.assignedAdminId, order.id).update(update);
    if (order.moderatorId) {
      mainOps.getModeratorOrder(order.moderatorId, order.id).update(update);
    }
    if (order.retoucherId)
    {
      mainOps.getRetoucherOrder(order.retoucherId, order.id).update(update);
    }
    // prevents dropbox files removal
    order.orderLink = '';
    removeUpload(order);
    return Promise.resolve();
  });
}

function AdminSetFinalLinksHandler(data, event) {
  if (!data.orderId) {
    return Promise.reject('Bad request');
  }
  const orderRef = mainOps.getOrder(data.orderId);
  return orderRef.once('value').then(snapshot => {
    const order = snapshot.val();
    if (!order) {
      return Promise.reject('order not found');
    } else if (order.finalLink) {
      return Promise.resolve();
    } else if (order.isBusy) {
      return Promise.resolve();
    }
    orderRef.update({busy: true});
    const orderFolderName = getFolderName(order);
    const folderPath = `/Clients/${order.displayName || order.email}/${orderFolderName}`;
    if (order.upload.uploading) {
      admin.database().ref('/FirebaseToDropbox').child(order.id).set({
        folderPath: folderPath + '/Files/',
        files: order.upload.uploading.files
      });
    }
    // todo: optimize promises
    if (order.upload.sharing) {
      return dropboxService.createFolder(folderPath + '/Progress').then(() => {
        return Promise.all([
          dropboxService.sharingCreateSharedLinkWithSettings(folderPath + '/Progress'),
          dropboxService.sharingCreateSharedLinkWithSettings(folderPath)
        ]);
      }).then(urls => {
        let update = {
          finalLink: order.upload.sharing.link,
          samplesLink: order.upload.sharing.link,
          orderLink: urls[1],
          progressLink: urls[0]
        };
        if (order.wantToApprove) {
          return dropboxService.createFolder(folderPath + '/Samples').then(() => {
            return dropboxService.sharingCreateSharedLinkWithSettings(folderPath + '/Samples').then(url => {
              update.samplesLink = url;
              return update;
            });
          })
        } else {
          return update;
        }
      }).then(update => {
        orderRef.update(update);
        mainOps.getAdminOrder(order.assignedAdminId, order.id).update(update);
        if (order.retoucherId) {
          mainOps.getRetoucherOrder(order.retoucherId, data.orderId).update(update);
        }
      });
    } else {
      return dropboxService.createFolder(folderPath + '/Done').then(() => {
        return dropboxService.createFolder(folderPath + '/Progress')
      }).then(() => {
        return Promise.all([
          dropboxService.sharingCreateSharedLinkWithSettings(folderPath + '/Done'),
          dropboxService.sharingCreateSharedLinkWithSettings(folderPath + '/Progress'),
          dropboxService.sharingCreateSharedLinkWithSettings(folderPath)
        ]).then(urls => {
          return {finalLink: urls[0], progressLink: urls[1], orderLink: urls[2]};
        });
      }).then(update => {
        if (order.wantToApprove) {
          return dropboxService.createFolder(folderPath + '/Samples').then(() => {
            return dropboxService.sharingCreateSharedLinkWithSettings(folderPath + '/Samples').then(url => {
              update.samplesLink = url;
              return update;
            });
          })
        } else {
          return Promise.resolve(update);
        }
      }).then(update => {
        orderRef.update(update);
        mainOps.getAdminOrder(order.assignedAdminId, order.id).update(update);
        // mainOps.getModeratorOrder(order.moderatorId, order.id).update(update);
        if (order.retoucherId) {
          mainOps.getRetoucherOrder(order.retoucherId, data.orderId).update(update);
        }
      });
    }
  });
}

// Admin assigns order to retoucher
function AdminAssignOrderHandler(data, event) {
  if (!data.retoucherId || !data.retoucherName || !data.orderId || !data.comment) {
    return Promise.reject('Bad request');
  }
  const orderRef = mainOps.getOrder(data.orderId);
  return orderRef.once('value').then(snapshot => {
    const order = snapshot.val();
    if (!order) {
      return Promise.reject('order not found');
    } else if (order.status !== enums.WorkStatus.New) {
      return Promise.reject('Invalid status');
    }
    delete order.price;
    delete order.paidAt;
    delete order.email;
    delete order.description.specialOffer;
    order.moderatorLink = data.moderatorLink;
    order.isRemote = data.isRemote;
    order.comment = data.comment;
    order.assignedAt = new Date().getTime();
    order.retoucherName = data.retoucherName;
    order.retoucherId = data.retoucherId;
    order.status = enums.WorkStatus.Assigned;
    mainOps.getModeratorOrder(data.moderatorId, data.orderId).set(order);
    sender.sendToModerator(event.params.userId, data.moderatorId, 'moderatorNewOrder', order);
    delete order.displayName;
    delete order.moderatorPrice;
    delete order.deadlineAt;
    if (data.isRemote) {
      delete order.upload;
      delete order.finalLink;
    } else {
      order.retoucherLink = order.finalLink;
      order.retoucherSamplesLink = order.samplesLink || '';
    }
    order.status = enums.WorkStatus.New;
    mainOps.getRetoucherOrder(data.retoucherId, data.orderId).set(order);
    sender.sendToRetoucher(event.params.userId, data.retoucherId, 'retoucherNewOrder', order);

    const update = {
      status: enums.WorkStatus.Assigned,
      moderatorLink: data.moderatorLink,
      isRemote: data.isRemote,
      retoucherId: data.retoucherId,
      retoucherName: data.retoucherName,
      moderatorId: data.moderatorId,
      moderatorName: data.moderatorName,
      moderatorComment: data.comment,
      assignedAt: new Date().getTime()
    };
    orderRef.update(update);
    mainOps.getAdminOrder(order.assignedAdminId, order.id).update(update);
    return Promise.resolve();
  });
}

// Admin
function AdminSendToClientHandler(data, event) {
  if (!data.orderId) {
    return Promise.reject('Bad request');
  }
  const orderRef = mainOps.getOrder(data.orderId);
  return orderRef.once('value').then(snapshot => {
    const order = snapshot.val();
    if (!order) {
      return Promise.reject('order not found');
    } else if (![enums.WorkStatus.InProgress, enums.WorkStatus.Checking, enums.WorkStatus.Approval, enums.WorkStatus.Failure, enums.WorkStatus.Ready].includes(order.status)) {
      return Promise.reject('Invalid status');
    }
    const update = {};
    if (!order.isApproved) {
      mainOps.getRetoucherOrder(order.retoucherId, data.orderId).update({
        sampleStatus: enums.SampleStatus.Ready
      });
      mainOps.getModeratorOrder(order.moderatorId, data.orderId).update({
        sampleStatus: enums.SampleStatus.Ready
      });
      update.sampleStatus = enums.SampleStatus.Ready;
      mainOps.getClientOrder(order.userId, data.orderId).update({
        status: enums.OrderStatus.Approval,
        samplesLink: order.samplesLink
      });
      order.sampleStatus = enums.SampleStatus.Ready;
      sender.sendToClient(event.params.userId, order.userId, 'clientOrderApprove', order);
    } else {
      mainOps.getRetoucherOrder(order.retoucherId, data.orderId).update({
        status: enums.WorkStatus.Approval
      });
      mainOps.getModeratorOrder(order.moderatorId, data.orderId).update({
        status: enums.WorkStatus.Ready
      });
      update.status = enums.WorkStatus.Ready;
      mainOps.getClientOrder(order.userId, data.orderId).update({
        status: enums.OrderStatus.Ready,
        finalLink: order.finalLink
      });
      sender.sendToClient(event.params.userId, order.userId, 'clientOrderReady', order);
    }
    orderRef.update(update);
    mainOps.getAdminOrder(order.assignedAdminId, order.id).update(update);
    return Promise.resolve();
  });
}

// Moderator or Retoucher dissociates order
function RetoucherDissociateHandler(data, event) {
  const orderData = data;
  if (!data.orderId) {
    return Promise.reject('Bad request');
  }
  const orderRef = mainOps.getOrder(data.orderId);
  return orderRef.once('value').then(snapshot => {
    const order = snapshot.val();
    if (!order) {
      return Promise.reject('order not found');
    } else if (![enums.WorkStatus.New, enums.WorkStatus.InProgress, enums.WorkStatus.Assigned, enums.WorkStatus.Checking, enums.WorkStatus.Approval, enums.WorkStatus.Failure, enums.WorkStatus.Ready].includes(order.status)) {
      return Promise.reject('Invalid status');
    }
    mainOps.getRetoucherOrder(order.retoucherId, data.orderId).remove();
    mainOps.getModeratorOrder(order.moderatorId, data.orderId).remove();

    const update = {
      status: enums.WorkStatus.New,
      retoucherId: '',
      retoucherName: '',
      moderatorName: '',
      moderatorId: '',
      assignedAt: new Date().getTime()
    };
    orderRef.update(update);
    mainOps.getAdminOrder(order.assignedAdminId, order.id).update(update);
    return Promise.resolve();
  });
}

// Retoucher accepts order
function RetoucherAcceptOrderHandler(data, event) {
  const orderData = data;
  if (!data.orderId) {
    return Promise.reject('Bad request');
  }
  const orderRef = mainOps.getOrder(data.orderId);
  return orderRef.once('value').then(snapshot => {
    const order = snapshot.val();
    if (!order) {
      return Promise.reject('order not found');
    } else if (order.status !== enums.WorkStatus.Assigned) {
      return Promise.reject('Invalid status');
    } else if (order.retoucherId !== event.params.userId) {
      return Promise.reject('No permission');
    }

    const update = {
      status: enums.WorkStatus.InProgress,
      acceptedAt: new Date().getTime()
    };
    if (!order.sampleStatus && order.wantToApprove && !order.isApproved) {
      update.sampleStatus = enums.SampleStatus.InProgress;
    }
    orderRef.update(update);
    mainOps.getAdminOrder(order.assignedAdminId, data.orderId).update(update);
    mainOps.getModeratorOrder(order.moderatorId, order.id).update(update);
    mainOps.getRetoucherOrder(order.retoucherId, data.orderId).update(update);
    // sender.sendToModerator(event.params.userId, order.moderatorId, 'moderatorRetoucherAcceptedOrder', order);
    return Promise.resolve();
  });
}

// Retoucher notifies moderator that order is ready to be approved
function RetoucherOrderApproveHandler(data, event) {
  const orderData = data;
  if (!data.orderId || !data.retoucherLink) {
    return Promise.reject('Bad request');
  }
  const orderRef = mainOps.getOrder(data.orderId);
  return orderRef.once('value').then(snapshot => {
    const adminOrder = snapshot.val();
    if (!adminOrder) {
      return Promise.reject('order not found');
    }
    const moderatorOrderRef = mainOps.getModeratorOrder(adminOrder.moderatorId, data.orderId);
    return moderatorOrderRef.once('value').then(snapshot => {
      const order = snapshot.val();
      if (!order) {
        return Promise.reject('order not found');
      }
      else if (![enums.WorkStatus.InProgress, enums.WorkStatus.Checking, enums.WorkStatus.Approval, enums.WorkStatus.Failure, enums.WorkStatus.Ready].includes(order.status)) {
        return Promise.reject('Invalid status');
      }
      const update = {};
      if (order.isApproved) {
        order.status = update.status = enums.WorkStatus.Checking;
        order.retoucherLink = update.retoucherLink = data.retoucherLink;
        order.retoucherComment = update.retoucherComment = data.comment;
      } else {
        order.sampleStatus = update.sampleStatus = enums.SampleStatus.Checking;
        order.retoucherSamplesLink = update.retoucherSamplesLink = data.retoucherLink;
        order.retoucherSamplesComment = update.retoucherSamplesComment = data.comment;
      }
      sender.sendToModerator(event.params.userId, adminOrder.moderatorId, 'moderatorOrderCheck', order);
      mainOps.getRetoucherOrder(order.retoucherId, data.orderId).update(update);
      moderatorOrderRef.update(update);
      // delete update.status;
      // delete update.sampleStatus;
      mainOps.getAdminOrder(order.assignedAdminId, data.orderId).update(update);
      orderRef.update(update);
      return Promise.resolve();
    });
  });
}

// Super can approve payment manually
function SuperApprovePaymentHandler(data, event) {
  if (!data.orderId) {
    return Promise.reject('Bad request');
  }
  return pay.processPayment(data.orderId, 0, true);
}

// Admin skips sample approval flow
function AdminSkipSampleApprovalHandler(data, event) {
  const orderData = data;
  if (!data.orderId) {
    return Promise.reject('Bad request');
  }
  const orderRef = mainOps.getOrder(data.orderId);
  return orderRef.once('value').then(snapshot => {
    const order = snapshot.val();
    if (!order) {
      return Promise.reject('order not found');
    } else if (order.isApproved || !order.wantToApprove) {
      return Promise.reject('Invalid isApproved or wantToApprove');
    }
    update  = {
      sampleStatus: enums.SampleStatus.Approved,
      isApproved: true,
    };
    if (order.retoucherId) {
      mainOps.getRetoucherOrder(order.retoucherId, data.orderId).update(update);
    }
    if (order.moderatorId) {
      mainOps.getModeratorOrder(order.moderatorId, data.orderId).update(update);
    }
    orderRef.update(update);
    mainOps.getAdminOrder(order.assignedAdminId, order.id).update(update);
    mainOps.getClientOrder(order.userId, order.id).update({
      status: enums.OrderStatus.InProgress
    });
    return Promise.resolve();
  });
}

exports.handlers = {
  'ClientOrder': ClientOrderHandler,
  'ClientOrderApprove': ClientOrderApproveHandler,
  'ClientCheckoutTrial': ClientCheckoutTrialHandler,
  'ClientOrderRemove': ClientOrderRemoveHandler,
  'ModeratorSetClientProfile': ModeratorSetClientProfileHandler,
  'ModeratorOrderApprove': ModeratorOrderApproveHandler,
  'AdminSetFinalLinks': AdminSetFinalLinksHandler,
  'RetoucherDissociate': RetoucherDissociateHandler,
  'RetoucherAcceptOrder': RetoucherAcceptOrderHandler,
  'RetoucherOrderApprove': RetoucherOrderApproveHandler,
  'AdminRemoveOrder': AdminRemoveOrderHandler,
  'AdminRemoveFiles': AdminRemoveFilesHandler,
  'AdminSkipSampleApproval': AdminSkipSampleApprovalHandler,
  'AdminUpdateOrderDates': AdminUpdateOrderDatesHandler,
  'AdminAssignOrder': AdminAssignOrderHandler,
  'AdminSendToClient': AdminSendToClientHandler,
  'SuperApprovePayment': SuperApprovePaymentHandler,
  'SuperUpdateOrderPrice': SuperUpdateOrderPriceHandler,
  'SuperAssignOrderAdmin': SuperAssignOrderAdminHandler
};
