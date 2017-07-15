'use strict';

const amqp = require('amqplib/callback_api');
const URL = 'amqp://localhost:5672';

module.exports = {
  channel: channel,
  encode: encode,
  decode: decode
};

function channel (queue, cb) {
  amqp.connect(URL, onceConnected);

  function onceConnected (err, conn) {
    if (err) throw err;
    conn.createChannel(onceChannelCreated);

    function onceChannelCreated (err, channel) {
      if (err) return cb(err);
      return channel.assertQueue(getChannel(queue), {durable: false}, onceQueueCreated);

      function onceQueueCreated (err) {
        if (err) return cb(err);
        return cb(null, channel, conn);
      }
    }
  }
}

function encode (doc) {
  return Buffer.from(JSON.stringify(doc));
}

function decode (doc) {
  return JSON.parse(doc);
}

function getChannel (queue) {
  return process.env.NODE_ENV === 'test' ? `${queue}-test` : queue;
}
