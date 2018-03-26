'use strict';

const util = require('util');
const Joi = require('joi');
const categoryController = require('./category/controller');
const subCategoryController = require('./subCategories/controller');
const appController = require('./appId/controller');
const appFromSubcategoryController = require('./appsFromSubcategory/controller');
const proxyConfig = require('../proxy.json');

const children = [];

module.exports = function(app) {
  // root function
  app.route({
    method: ['GET'],
    path: '/',
    handler: (req, rep) => {
      rep('Use /{countryCode}/categories, ' +
              '/{countryCode}/subcategories/{catId} and ' +
              '/{countryCode}/app/{appId} for info fetching');
    }
  });
  // getCategories()
  app.route({
    method: ['GET'],
    path: '/{countryCode}/categories',
    handler: (req, rep) => {
      const child = categoryController.getCategories(proxyConfig[req.params.countryCode],
                                                     proxyConfig.credential);
      let categories = [];

      child.stdout.on('data', (data) => {
        categories = JSON.parse(data.toString());
      });

      child.stdout.on('end', () => {
        rep(categories);
      });
    },
    config: {
      validate: {
        params: {
          countryCode: Joi.string().required()
        }
      }
    }
  });
  // getSubCategories()
  app.route({
    method: ['GET'],
    path: '/{countryCode}/subcategories/{catId}',
    handler: (req, rep) => {
      const child = subCategoryController.getSubCategories(req.params.catId,
                                                           proxyConfig[req.params.countryCode],
                                                           proxyConfig.credential);
      let subCategories = [];

      child.stdout.on('data', (data) => {
        subCategories = data.toString().split(',');
      });

      child.stdout.on('end', () => {
        rep(subCategories);
      });
    },
    config: {
      validate: {
        params: {
          countryCode: Joi.string().required(),
          catId: Joi.string().required()
        }
      }
    }
  });
  // getApp()
  app.route({
    method: ['GET'],
    path: '/{countryCode}/app/{appId}',
    handler: (req, rep) => {
      const child = appController.getApp(proxyConfig[req.params.countryCode],
                                         req.params.appId,
                                         proxyConfig.credential);
      let subCategories = [];

      child.stdout.on('data', (data) => {
        subCategories = data.toString().split(',');
      });

      child.stdout.on('end', () => {
        rep(subCategories);
      });
    },
    config: {
      validate: {
        params: {
          countryCode: Joi.string().required(),
          appId: Joi.string().required()
        }
      }
    }
  });
  // getAppsFromSubcategory()
  app.route({
    method: ['GET'],
    path: '/{countryCode}/apps/{catId}/{subcatId}',
    handler: (req, rep) => {
      const child = appFromSubcategoryController.getAppsFromSubcategory(proxyConfig[req.params.countryCode],
                                                                        req.params.catId,
                                                                        req.params.subcatId,
                                                                        proxyConfig.credential);
      let apps = [];

      child.stdout.on('data', (data) => {
        apps = data.toString().split(',');
      });

      child.stdout.on('end', () => {
        rep(apps);
      });
    },
    config: {
      validate: {
        params: {
          countryCode: Joi.string().required(),
          subcatId: Joi.string().required(),
          catId: Joi.string().required()
        }
      }
    }
  })
};
