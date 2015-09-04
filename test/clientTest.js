var assert = require('chai').assert;
var sinon = require('sinon');
var Client = require('../lib/client.js');
var client;

function getFakeNetSocket() {
  return {
    on: function() {},
    write: function() {}
  };
};

describe('Client', function() {

  beforeEach(function() {
    client = new Client(getFakeNetSocket());
  });

  it('can store and retrieve aribtrary data', function() {
    client.set('test', 'testData');
    assert.equal(client.get('test'), 'testData');
  });

});
