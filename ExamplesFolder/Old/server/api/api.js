'use strict';

const express = require('express');
const async = require('async');
const _ = require('lodash');
const router = express.Router();

const db = require('../models/index');
const { URLS, QUEUE_DELAY } = require('../consts');

const { closeConnection, getAppInfoQueue, generatePairs } = require('./utils');
const models = db.sequelize.models;

router.get('/api/database/categories', (outerReq, outerRes) => {
  fetch('https://playrest.stage.nodeart.io/gb/categories')
    .then(response => {
      response.json().then(res => {
        outerRes.send(res);
        models.Categories
          .bulkCreate(res)
          .then(result => result)
          .then(result => {
            outerRes.setHeader('Content-Type', 'application/json');
            outerRes.send(result);
          })
          .catch(err => outerRes.status(404).send(err)); // TODO: fix header
      });
    })
    .catch(err => {
      console.error(err);
      throw err;
    });
});

router.get('/api/database/items', (outerReq, outerRes) => {
  models.App
    .findAll()
    .then((items) => {
      outerRes.setHeader('Content-Type', 'application/json');
      outerRes.send(items);
    })
    .catch(err => outerRes.status(404).send(err));
});

router.get('/api/database/apps/', (outerReq, outerRes) => {
  const countries = require('../countries.json');

  outerReq.setTimeout(0);
  fetch('https://playrest.stage.nodeart.io/gb/categories')
    .then(result => result.json())
    .then(categories => {
      const uniquePairs = generatePairs('category', categories, countries);

      const queue = async.queue((task, cb) => {
        console.log('55 | GET CATEGORY :', task.category,
          ' FROM COUNTRY: ', task.country);
        fetch(URLS.GET_ALL_APPS(task.country, task.category))
          .then(result => result.json())
          .then(result => {
            getAppInfoQueue(result, task.category).then(() => {
              console.log('59 | Successfull return from getAppInfoQueue()');
              _.delay(cb, QUEUE_DELAY);
            }).then(() => outerRes.send('Success')).catch(err => {
              console.log(err);
              _.delay(cb, QUEUE_DELAY);
              outerRes.status(500).json(err);
            });
          });
      });

      uniquePairs.map(pair => {
        queue.push(pair);
      });
    })
    .catch(error => console.log(error));
});

router.get('/api/database/categories_from_db', (outerReq, outerRes) => {
  console.log('GET all categories from DB');
  const close = closeConnection(outerRes);
  models.Categories
    .findAll()
    .then(close)
    .catch(err => close('NOT_FOUND', 404));
});

router.get('/api/database/apps_db', (outerReq, outerRes) => {
  console.log('GET all apps from DB');

  models.Apps.hasMany(models.Categories, {
    foreignKey: 'appId'
  });
  models.Categories.belongsTo(models.Apps, {
    foreignKey: 'appId'
  });

  models.Apps
    .findAll()
    .map(apps => apps.dataValues)
    .map(apps => {
      const categories = models.Categories
        .findAll({ where: { appId: apps.appId } })
        .then(cats => cats);
      return { apps, categories };
    })
    .then(result => result.map(cat =>
      cat['categories']
        .then(output => {
          return output.map(sup => {
            Object.assign(sup.dataValues, cat.apps);
            return sup.dataValues;
          });
        })
        .then(categories => categories)))
    .then(finallyRes =>
      Promise.all(finallyRes).then(res =>
        outerRes.send(_.flattenDeep(res))));


  // .then(res => {
  //   return res.reduce((accum, values) => {
  //     return models.Categories.
  //       findAll({
  //         where: { appId: values.dataValues.appId }
  //       })
  //       .then(result => result.map(total => {
  //         Object.assign(total.dataValues, values.dataValues);
  //         return total.dataValues;
  //       }))
  //       .then(res => {
  //         console.log(res);
  //         return accum.concat(res);
  //       });
  //   }, []);
  // })
  // .then(res => console.log(res));
});

module.exports = router;
