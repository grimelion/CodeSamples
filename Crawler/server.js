'use strict';

const Hapi = require('hapi');
const cluster = require('cluster');
const Boom = require('boom');

const server = new Hapi.Server();
const port = process.env.PORT || 3022;

server.connection({port: port, address: '0.0.0.0'});

const routes = require('./routes/routes');
routes(server);

server.ext('onPreResponse', function (request, reply) {
  if (request.response.isBoom) {
    return reply(Boom.badRequest('There is no url'));
  } else {
    return reply.continue();
  }
});

process.on('exit', () => {
  server.close();
});

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log(`Server running at: ${port}`);
});
