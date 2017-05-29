'use strict';

const seneca = require('seneca')();
const entity = require('seneca-entity');
const mongoStore = require('seneca-mongo-store');
const order = require('./lib/order');
const dotenv = require('dotenv');
const amqp = require('seneca-amqp-transport');

dotenv.load({silent: true});

const opts = {
  mongo: {
    uri: process.env.URI || 'mongodb://127.0.0.1:27017/seneca-order',
    options: {}
  }
};

seneca.use(entity);
seneca.use(mongoStore, opts.mongo);
seneca.use(order);
seneca.use(amqp);
seneca.listen({
  pin: 'role:order,cmd:*',
  port: process.env.PORT || 9001
}).client({
  type: 'amqp',
  pin: 'role:events,cmd:create_invoice',
  url: process.env.AMQP_URL || 'amqp://localhost'
});
