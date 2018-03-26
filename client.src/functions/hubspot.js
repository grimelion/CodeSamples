const Client = require('hubspot');
const enums = require('./enums');

const client = new Client();

client.useKey('1212ef36-a7db-455b-8c1a-1f29c042bcfe');
// client.useToken();

exports.updateUser = function(id, user) {
  const match = user.displayName.match(/^(\S+)\s(.*)/);
  let update = {
    "properties": [
      {
        "property": "email",
        "value": user.email
      },
      {
        "property": "website",
        "value": user.portfolio || user.additionalProfiles || user.facebookPage || ''
      }
    ]
  };
  if (match && match.length) {
    const firstLast = match.slice(1);
    update.properties.push({
      "property": "firstname",
      "value": firstLast[0]
    });
    update.properties.push({
      "property": "lastname",
      "value": firstLast[1] || ''
    });
  } else {
    console.log('no name');
  }
  return searchUser(id).then(hubspotUser => {
    return new Promise(resolve => {
      if (hubspotUser) {
        client.contacts.update(hubspotUser.vid, update, resolve);
      } else {
        client.contacts.create(update, resolve);
      }
    });
  });
};

function getHubspotOwnerByUserId(id) {
  return new Promise((resolve, reject) => {
    client.contacts.getById(id, (err, res) => {
      if (res && res.properties && res.properties.hubspot_owner_id) {
        resolve(res.properties.hubspot_owner_id.value);
      }
      resolve(null);
    });
  });
}

function searchUser(id) {
  return new Promise((resolve, reject) => {
    client.contacts.search(id, (err, res) => {
      if (!res) {
        resolve();
      }
      if (!res.contacts.length) {
        resolve(null);
      } else {
        console.log(res.contacts[0]);
        resolve(res.contacts[0])
      }
    });
  });
}

exports.createDeal = function (order) {
  return searchUser(order.email).then(hubspotUser => {
    if (!hubspotUser) {
      // user should have been created
      return null;
    }
    return getHubspotOwnerByUserId(hubspotUser.vid).then(ownerId => {
      return new Promise((resolve, reject) => {
        client.deals.create({
          "associations": {
            "associatedVids": [
              hubspotUser.vid
            ]
          },
          "properties": [
            {
              "value": order.name,
              "name": "dealname"
            },
            {
              "value": "default",
              "name": "pipeline"
            },
            {
              "value": "closedwon",
              "name": "dealstage"
            },
            {
              "value": ownerId,
              "name": "hubspot_owner_id"
            },
            {
              "value": order.price / 100,
              "name": "amount"
            },
            {
              "value": order.numberOfImages,
              "name": "number_of_images"
            },
            {
              "value": enums.WorkStatus.properties[order.status].name,
              "name": "order_status"
            },
            {
              "value": order.sampleStatus == null ? '' : enums.SampleStatus.properties[order.sampleStatus].name,
              "name": "order_samples_status"
            },
            {
              "value": order.description.orderTodoText,
              "name": "order_type"
            },
            {
              "value": order.addedAt,
              "name": "createdate"
            }
          ]
        }, (err, res) => {
          console.log('res');
          console.log(res);
          console.log('err');
          console.log(err);
          resolve(res ? res.dealId : null)
        });
      });
    });
  });
};

exports.updateDeal = function (dealId, order) {
  return new Promise((resolve, reject) => {
    client.deals.updateById(dealId, {
      "properties": [
        {
          "value": enums.WorkStatus.properties[order.status].name,
          "name": "order_status"
        },
        {
          "value": order.sampleStatus == null ? '' : enums.SampleStatus.properties[order.sampleStatus].name,
          "name": "order_samples_status"
        }
      ]
    }, (err, res) => {
      resolve()
    });
  });
};
// exports.updateUser('1111', {
//   displayName: 'User king',
//   email: 'client@nodeart.io'
// });

// getUserById('1111');

// getHubspotOwnerByUserId(451).then(ownerId => {
//   console.log(ownerId);
// });
// 29352918

// exports.createDeal(
//   {
//     "acceptedAt" : 1501496612394,
//     "addedAt" : 1501496453562,
//     "additionalModeratorOrderLink" : "",
//     "additionalModeratorSamplesLink" : "http://asdas.ccd",
//     "assignedAdminId" : "dLb4xKQuQJRJd9Ribg8dfW4uZQ43",
//     "assignedAt" : 1501496478598,
//     "assignedModeratorId" : "dLb4xKQuQJRJd9Ribg8dfW4uZQ43",
//     "clientSamplesCorrections" : "66",
//     "comment" : "11",
//     "cullingLeave" : 0,
//     "deadlineAt" : 1502274053562,
//     "description" : {
//       "finalPercentOfImages" : 0,
//       "orderTodoText" : "Color correction",
//       "specialOffer" : "1000 for 159$",
//       "turnaroundTime" : "Standard (5-7 business days)"
//     },
//     "displayName" : "User King",
//     "email" : "bh@hubspot.com",
//     "finalLink" : "https://www.dropbox.com/sh/kmwx94nklsh3oif/AADa0RXQhj-8CSbMsWr7SZXEa?dl=0",
//     "id" : 594239,
//     "isRemote" : 1,
//     "moderatorComment" : "ивптаввпрвара",
//     "moderatorId" : "dLb4xKQuQJRJd9Ribg8dfW4uZQ43",
//     "moderatorLink" : "https://www.dropbox.com/sh/6tvbs0s5tkyitqc/AAAPdj3YCFTTYT5XFNJrIXVUa?dl=0",
//     "moderatorName" : "Super Martin",
//     "moderatorPrice" : 4600,
//     "moderatorSamplesCorrections" : "566",
//     "name" : "Test order",
//     "numberOfImages" : 200,
//     "orderLink" : "https://www.dropbox.com/sh/zl54l9q7gqbbfgm/AAA7H4-uT9QMZ6uu5CA4s9WNa?dl=0",
//     "paidAt" : 1501496468414,
//     "price" : 4600,
//     "progressLink" : "https://www.dropbox.com/sh/6tvbs0s5tkyitqc/AAAPdj3YCFTTYT5XFNJrIXVUa?dl=0",
//     "retoucherDeadlineAt" : 1501669253562,
//     "retoucherId" : "dLb4xKQuQJRJd9Ribg8dfW4uZQ43",
//     "retoucherName" : "Super Martin",
//     "retoucherPrice" : 4600,
//     "retoucherSamplesComment" : "4",
//     "retoucherSamplesLink" : "http://asdas.cc",
//     "sampleStatus" : 5,
//     "samplesLink" : "https://www.dropbox.com/sh/tml9kpzo9l4g5ih/AAAkKXnuTg2Gc3fyIX3ezsmfa?dl=0",
//     "specialOffer" : 1,
//     "status" : 3,
//     "todo" : 1,
//     "trial" : false,
//     "turnaroundTime" : 0,
//     "type" : "wedding",
//     "upload" : {
//       "linking" : {
//         "copiedToLink" : "https://www.dropbox.com/home/Clients/User%20King",
//         "link" : "п врвпарвпав в"
//       }
//     },
//     "userId" : "BidTGfqJsghCQwINEeoKqjFMUlr1",
//     "wantToApprove" : true
//   }
// );
