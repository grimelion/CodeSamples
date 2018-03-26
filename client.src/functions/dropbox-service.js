const Dropbox = require('dropbox');
var dbx = new Dropbox({ accessToken: 'tokenExample' });

exports.getSharedFolder = function () {
  return true;
};

exports.sharingMountFolder = function (sharing) {
  if (sharing && sharing.shareId) {
    return dbx.sharingMountFolder({shared_folder_id: sharing.shareId}).then(res => {
      return true;
    }).catch(err => {
      if (err && err.response && err.response.body.error['.tag'] === 'already_mounted') {
        console.log("This shared folder has already been added.");
        return true;
      } else {
        console.log(err);
        return false;
      }
    });
  } else {
    return Promise.resolve(false);
  }
};

exports.filesCopyReferenceSave = function (copy_reference, path) {
  return dbx.filesCopyReferenceSave({copy_reference: copy_reference, path: path}).then(res => {
    return true;
  }).catch(err => {
    console.log(err);
    return false;
  });
};

exports.urlSave = function (url, pathAndFilename) {
  return dbx.filesSaveUrl({url: url, path: pathAndFilename}).then(res => {
    return true;
  }).catch(err => {
    console.log('dropbox err:');
    console.log(err);
    return false;
  });
};

exports.createFolder = function (path) {
  return dbx.filesCreateFolder({path: path}).then(res => {
    return res.id;
  });
};

exports.sharingCreateSharedLinkWithSettings = function (path) {
  return dbx.sharingCreateSharedLinkWithSettings({path: path, }).then(res => {
    if (res && res.url) {
      return res.url;
    } else {
      return Promise.reject('sharingCreateSharedLinkWithSettings failed');
    }
  });
};

exports.filesDelete = function (path) {
  return dbx.filesDelete({path: path, }).catch((err) => console.log(err));
};
