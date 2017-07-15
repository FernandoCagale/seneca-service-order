const Lab = require('lab');
const Code = require('code');
const Seneca = require('seneca');
const entity = require('seneca-entity');
const mongoStore = require('seneca-mongo-store');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;
const ROLE = 'order';

const opts = {
  mongo: {
    uri: 'mongodb://127.0.0.1:27017/seneca-order-test',
    options: {}
  }
};

function testSeneca (fin) {
  return Seneca({log: 'test'})
    .use(entity)
    .use(mongoStore, opts.mongo)
    .test(fin)
    .use(require('../lib/order'));
}

describe('test ORDER', () => {
  let _id;

  it('create', (fin) => {
    const seneca = testSeneca(fin);

    const pattern = {
      role: ROLE,
      cmd: 'create',
      emission: '01/06/2017',
      price: 25.00,
      client: 'Client test'
    };

    seneca
    .gate()
    .act(pattern, (ignore, result) => {
      expect(result.order.emission).to.equal('01/06/2017');
      expect(result.order.price).to.equal(25.00);
      expect(result.order.client).to.equal('Client test');
      expect(result.order.id).to.exist();
      expect(result.ok).to.equal(true);
      _id = result.order.id;
    })
    .ready(fin);
  });

  it('findAll', (fin) => {
    const seneca = testSeneca(fin);

    const pattern = {
      role: ROLE,
      cmd: 'findAll'
    };

    seneca
    .gate()
    .act(pattern, (ignore, result) => {
      expect(result.orders).to.exist();
    })
    .ready(fin);
  });

  it('findById', (fin) => {
    const seneca = testSeneca(fin);

    const pattern = {
      role: ROLE,
      cmd: 'findById',
      id: _id
    };

    seneca
    .gate()
    .act(pattern, (ignore, result) => {
      expect(result.order.emission).to.equal('01/06/2017');
      expect(result.order.price).to.equal(25.00);
      expect(result.order.client).to.equal('Client test');
      expect(result.order.id).to.exist();
      expect(result.ok).to.equal(true);
    })
    .ready(fin);
  });

  it('findById not found', (fin) => {
    const seneca = testSeneca(fin);

    const pattern = {
      role: ROLE,
      cmd: 'findById',
      id: '595a66789f14e52b68b28d3a'
    };

    seneca
    .gate()
    .act(pattern, (ignore, result) => {
      expect(result.ok).to.equal(false);
      expect(result.why).to.equal('ID not found');
    })
    .ready(fin);
  });

  it('update', (fin) => {
    const seneca = testSeneca(fin);

    const pattern = {
      role: ROLE,
      cmd: 'update',
      id: _id,
      emission: '06/06/2017',
      price: 50.00,
      client: 'Client test - alter'
    };

    seneca
    .gate()
    .act(pattern, (ignore, result) => {
      expect(result.order.emission).to.equal('06/06/2017');
      expect(result.order.price).to.equal(50.00);
      expect(result.order.client).to.equal('Client test - alter');
      expect(result.order.id).to.exist();
      expect(result.ok).to.equal(true);
    })
    .ready(fin);
  });

  it('update not found', (fin) => {
    const seneca = testSeneca(fin);

    const pattern = {
      role: ROLE,
      cmd: 'update',
      id: '595a66789f14e52b68b28d3c',
      emission: '06/06/2017',
      price: 50.00,
      client: 'Client test - alter'
    };

    seneca
    .gate()
    .act(pattern, (ignore, result) => {
      expect(result.ok).to.equal(false);
      expect(result.why).to.equal('ID not found');
    })
    .ready(fin);
  });

  it('remove', (fin) => {
    const seneca = testSeneca(fin);

    const pattern = {
      role: ROLE,
      cmd: 'remove',
      id: _id
    };

    seneca
    .gate()
    .act(pattern, (ignore, result) => {
      expect(result.ok).to.equal(true);
    })
    .ready(fin);
  });

  it('remove not found', (fin) => {
    const seneca = testSeneca(fin);

    const pattern = {
      role: ROLE,
      cmd: 'remove',
      id: '595a66789f14e52b68b28d3w'
    };

    seneca
    .gate()
    .act(pattern, (ignore, result) => {
      expect(result.ok).to.equal(false);
      expect(result.why).to.equal('ID not found');
    })
    .ready(fin);
  });
});
