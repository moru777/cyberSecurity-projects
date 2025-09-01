/*
 * Functional tests for Stock Price Checker
 * Using Mocha + Chai + chai-http
 * Place this file at: tests/2_functional-tests.js
 * Run with: NODE_ENV=test npm test
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server'); // Express app

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(5000);

  let initialLikes = null;
  let likedOnceLikes = null;

  test('Viewing one stock: GET /api/stock-prices', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'AAPL' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'stockData');

        const sd = res.body.stockData;
        assert.isObject(sd);
        assert.property(sd, 'stock');
        assert.property(sd, 'price');
        assert.isTrue(typeof sd.likes === 'number' || sd.likes === undefined);

        if (typeof sd.likes === 'number') initialLikes = sd.likes;
        done();
      });
  });

  test('Viewing one stock and liking it: GET /api/stock-prices', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'AAPL', like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        const sd = res.body.stockData;
        assert.isObject(sd);
        assert.property(sd, 'stock');
        assert.property(sd, 'price');
        assert.property(sd, 'likes');
        assert.isNumber(sd.likes);

        likedOnceLikes = sd.likes;
        if (initialLikes !== null) {
          assert.strictEqual(likedOnceLikes, initialLikes + 1);
        }
        done();
      });
  });

  test('Viewing the same stock and liking it again: GET /api/stock-prices', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'AAPL', like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        const sd = res.body.stockData;
        assert.isObject(sd);
        assert.property(sd, 'likes');
        assert.strictEqual(sd.likes, likedOnceLikes);
        done();
      });
  });

  test('Viewing two stocks: GET /api/stock-prices', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'] })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        const sd = res.body.stockData;
        assert.isArray(sd);
        assert.lengthOf(sd, 2);

        sd.forEach(item => {
          assert.property(item, 'stock');
          assert.property(item, 'price');
          if ('rel_likes' in item) assert.isNumber(item.rel_likes);
        });
        done();
      });
  });

  test('Viewing two stocks and liking them: GET /api/stock-prices', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'], like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        const sd = res.body.stockData;
        assert.isArray(sd);
        assert.lengthOf(sd, 2);

        sd.forEach(item => {
          assert.property(item, 'stock');
          assert.property(item, 'price');
          assert.property(item, 'rel_likes');
          assert.isNumber(item.rel_likes);
        });

        // Sum of relative likes should be zero
        assert.strictEqual(sd[0].rel_likes + sd[1].rel_likes, 0);
        done();
      });
  });
});
