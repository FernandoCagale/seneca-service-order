'use strict';

require('dotenv').load({silent: true});

const seneca = require('seneca')({base: 'api-order'});
const entity = require('seneca-entity');
const mesh = require('seneca-mesh');
const consul = require('seneca-consul-registry');
const mongoStore = require('seneca-mongo-store');
const order = require('./lib/order');

const PINS = [
  'role:order,cmd:*'
];

const opts = {
  mongo: {
    uri: process.env.URI || 'mongodb://127.0.0.1:27017/seneca-order',
    options: {}
  },
  mesh: {
    listen: [{
      pin: PINS,
      host: process.env.ADDR || '127.0.0.13',
      port: process.env.PORT || 50000 + Math.floor((10000 * Math.random()))
    }],
    discover: {
      registry: {
        active: true
      },
      multicast: {
        active: false
      },
      guess: {
        active: false
      }
    }
  },
  consul: {
    host: process.env.CONSUL_ADDR || '127.0.0.1'
  }
};

seneca.use(consul, opts.consul);
seneca.use(entity);
seneca.use(mongoStore, opts.mongo);
seneca.use(order);
seneca.use(mesh, opts.mesh);
