const enums = require('./enums');
const admin = require('firebase-admin');
const dropboxService = require('./dropbox-service');

exports.getClientOrder = function(clientId, oderId) {
  return admin.database().ref('/Orders/Client').child(clientId).child(oderId);
};

exports.getModeratorOrder = function(moderatorId, oderId) {
  return admin.database().ref('/Orders/Moderator').child(moderatorId).child(oderId);
};

exports.getRetoucherOrder = function(retoucherId, oderId) {
  return admin.database().ref('/Orders/Retoucher').child(retoucherId).child(oderId);
};

exports.getAdminOrder = function(adminId, oderId) {
  return admin.database().ref('/Orders/Admin').child(adminId).child(oderId);
};

exports.getOrder = function(oderId) {
  return admin.database().ref('/Orders/Super').child(oderId);
};

exports.getDefaultAdmin = function() {
  return admin.database().ref('FlowConfig').child('defaultAdmin')
};
