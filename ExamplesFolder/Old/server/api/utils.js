'use strict';
const async = require('async');
const _ = require('lodash');
const countries = require('../countries');
const db = require('../models/index');
const { QUEUE_DELAY, URLS, RESPONSE_CODES } = require('../consts');

let appInfoArr = [];
let dataJsonArr = [];

/**
 * Generate unique pairs from two arrays
 * @param {String} type
 * @param {Array} firstArray
 * @param {Array} secondArray
 * */

const generatePairs = function(type, firstArray, secondArray) {
  const result = [];
  for (let innerIndex = 0; innerIndex < firstArray.length; innerIndex++) {
    let subcatId = '';
    if (firstArray[innerIndex].subCategory)
      subcatId = firstArray[innerIndex].subCategory;

    if (firstArray[innerIndex].link) {
      for (let i = 0; i < firstArray[innerIndex].link.length; i++) {
        for (let j = 0; j < secondArray.length; j++) {
          result.push({
            [type]: firstArray[innerIndex].link[i],
            country: secondArray[j], subcatId
          });
        }
      }
    } else {
      for (let i = 0; i < firstArray.length; i++) {
        for (let j = 0; j < secondArray.length; j++) {
          result.push({
            [type]: firstArray[i].id,
            country: secondArray[j].key
          });
        }
      }
    }
  }
  return result;
};

/**
 * Sending applications to database
 * @param appInfo
 * @param dataJson
 * @param cb
 */

const sendAppsToDB = function(appInfo, dataJson, cb) {
  appInfo.map(obj => {
    db.sequelize.models.Categories
      .upsert(obj)
      .then(() => console.log('58 | Success upsert Categories'))
      .catch((err) => console.log('59 | Error upserting Categories: ', err));
  });
  dataJson.map(obj => {
    db.sequelize.models.Apps
      .upsert(obj)
      .then(() => console.log('64 | Success upsert Apps'))
      .catch((err) => console.log('65 | Error upserting Apps: ', err));
  });
  _.delay(cb, QUEUE_DELAY);
};

/**
 * Get app's info
 * @param appInfo,
 * @param result,
 * @param appObj,
 * @param cb
 * @returns {Promise}
 */

const getAppInfo = function(appInfo, result, appObj, cb) {
  return new Promise((resolve, reject) => {
    result.json().then(dataJson => {
      if (dataJson.statusCode === RESPONSE_CODES.BAD_REQUEST) {
        reject(dataJson.statusCode);
      } else if (dataJson.statusCode === RESPONSE_CODES.BAD_GATEWAY) {
        reject(appObj);
      } else {
        dataJson['appId'] = appInfo.appId;
        appInfoArr.push(appInfo);
        dataJsonArr.push(dataJson);
        if (appInfoArr.length === 5 || dataJsonArr.length === 5) {
          sendAppsToDB(appInfoArr, dataJsonArr, cb);
          resolve(true);
          appInfoArr = [];
          dataJsonArr = [];
        } else {
          resolve(true);
          _.delay(cb, QUEUE_DELAY);
        }
      }
    });
  });
};

/**
 * Queue for apps stack
 * @param resultFromApps
 * @param category
 * @returns {Promise}
 */

const getAppInfoQueue = function(resultFromApps, category) {
  return new Promise(resolve => {
    const uniquePairs = generatePairs('appId', resultFromApps, countries);
    _.sortBy(uniquePairs, ['appId', 'country']);

    const queueApps = async.queue((task, cb) => {
      const newTask = _.last(task.appId.split('='));
      console.log('74 | QUEUE #' +
        appInfoArr.length +
        'from country: ' +
        task.country.text);

      console.log('ADDR: ', URLS.GET_APP(task.country.key, newTask));
      fetch(URLS.GET_APP(task.country.key, newTask))
        .then(result => {
          getAppInfo({
            appId: newTask,
            subcatTitle: task.subcatId,
            dateStart: Date.now(),
            country: task.country.text,
            catId: category
          },
          result, task, cb)
            .then(() => console.log('86 | Returned from getAppInfo()'))
            .catch(errTask => {
              if (errTask === RESPONSE_CODES.BAD_REQUEST) {
                console.log(errTask);
                _.delay(cb, QUEUE_DELAY);
              } else if (errTask === RESPONSE_CODES.BAD_GATEWAY) {
                queueApps.push(task);
                console.log(errTask);
              }
            });
        })
        .catch(err => {
          console.log(err);
          queueApps.push(task);
          _.delay(cb, QUEUE_DELAY);
        });
    }, 5);

    uniquePairs.map(objects => {
      queueApps.push(objects);
    });

    queueApps.drain = () => {
      console.log('109 | All apps were fetched.');
      resolve('Success');
    };
  });
};

/**
 * Close connection
 * @param response
 * @returns {Promise}
 */

const closeConnection = response => (reason, code) =>
  response.status(code || 200).send(reason);


module.exports = {
  getAppInfoQueue,
  closeConnection,
  generatePairs
};
