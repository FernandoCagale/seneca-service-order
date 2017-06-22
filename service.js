'use strict';

require('dotenv').load({silent: true});

const seneca = require('seneca')();
const entity = require('seneca-entity');
const mongoStore = require('seneca-mongo-store');
const order = require('./lib/order');

const opts = {
  mongo: {
    uri: process.env.URI || 'mongodb://127.0.0.1:27017/seneca-order',
    options: {}
  }
};

seneca.use(entity);
seneca.use(mongoStore, opts.mongo);
seneca.use(order);
seneca.listen({
  pin: 'role:order,cmd:*',
  port: process.env.PORT || 9001
});
