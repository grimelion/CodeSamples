'use strict';

const express              = require('express');
const path                 = require('path');
const bodyParser           = require('body-parser');
const app                  = express();
const api                  = require('./api/api');
const PORT                 = process.env.PORT || 8000;
const root                 = path.join(__dirname, '/../dist/');
const models               = require('./models');

require('es6-promise').polyfill();
require('isomorphic-fetch');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use('/', api);
app.use(express.static(root));
app.get('*', (request, response) => {
  console.log(response.statusCode);
  response.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

models.sequelize.authenticate()
  .then(() => {
    models.sequelize.sync().then(() => {
      console.log('All models synchronized');
    }).catch(err => {
      console.log('DB sync error in: ', err);
      throw err;
    });
  }).catch(error => {
    console.log('DB auth error in: ', error);
    throw error;
  });

app.timeout = 0;

app.listen(PORT, () => {
  console.log(`SERVER Listening on ${PORT}`);
});
