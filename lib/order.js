'use strict';

module.exports = function order (options) {
  const seneca = this;
  const order = seneca.make('order');
  const ROLE = 'order';
  const ROLE_AMQP = 'events';

  seneca.add({role: ROLE, cmd: 'findAll'}, findAll);
  seneca.add({role: ROLE, cmd: 'findById'}, findById);
  seneca.add({role: ROLE, cmd: 'create'}, create);
  seneca.add({role: ROLE, cmd: 'update'}, update);
  seneca.add({role: ROLE, cmd: 'remove'}, remove);

  function findAll (args, done) {
    return order.list$({}, (err, orders) => {
      if (err) return done(err);
      return done(null, {orders: orders});
    });
  }

  function findById (args, done) {
    return order.load$({id: args.id}, (err, order) => {
      if (err) return done(err);
      if (!order) return done(null, {ok: false, why: 'ID not found'});
      return done(null, {ok: true, order: seneca.util.clean(order)});
    });
  }

  function queueInvoice (order) {
    seneca.act({role: ROLE_AMQP, cmd: 'create_invoice', id: order.id, emission: order.emission, price: order.price, client: order.client}, (err, response) => {
      if (err) seneca.log.error('Error QUEUE INVOICE', err);
      seneca.log('ADD INVOICE', order);
    });
  }

  function create (args, done) {
    const order = seneca.make$('order');
    order.emission = args.emission;
    order.price = args.price;
    order.client = args.client;

    return order.save$((err, value) => {
      if (err) return done(err);
      const newOrder = seneca.util.clean(value);
      queueInvoice(newOrder);
      return done(null, {ok: true, order: newOrder});
    });
  }

  function update (args, done) {
    return order.load$({id: args.id}, (err, order) => {
      if (err) return done(err);
      if (!order) return done(null, {ok: false, why: 'ID not found'});

      order.emission = args.emission;
      order.price = args.price;
      order.client = args.client;
      return order.save$((err, value) => {
        if (err) return done(err);
        return done(null, {ok: true, order: seneca.util.clean(value)});
      });
    });
  }

  function remove (args, done) {
    const id = args.id;
    return order.load$({id: id}, (err, order) => {
      if (err) return done(err);
      if (!order) return done(null, {ok: false, why: 'ID not found'});

      return order.remove$({id: id}, (err, order) => {
        if (err) return done(err);
        return done(null, {ok: true});
      });
    });
  }
};
