var assert = require('chai').assert;
var sinon = require('sinon');
var Socket = require('../lib/socket.js');
var socket;

function getFakeNetSocket() {
  return {
    on: function() {},
    write: function() {}
  };
};

describe('Socket', function() {

  beforeEach(function() {
    socket = new Socket(getFakeNetSocket());
  });

  it('can store and retrieve aribtrary data', function() {
    socket.set('test', 'testData');
    assert.equal(socket.get('test'), 'testData');
  });

});
