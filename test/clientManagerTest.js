var assert = require('chai').assert;
var sinon = require('sinon');
var ClientManager = require('../lib/clientManager.js');
var clientManager;

function getFakeSocket() {
  return {
    on: function() {},
    onData: function() {},
    send: sinon.stub(),
    socketId: Date.now()
  };
}

describe('Client Manager', function() {

  beforeEach(function() {
    clientManager = new ClientManager();
  })

  it('adds a client', function() {
    clientManager.addClient(getFakeSocket());
    assert.equal(clientManager.getClientCount(), 1);
  });

  it('removes a client by an id', function() {
    var fakeSocket = getFakeSocket();
    clientManager.addClient(fakeSocket);
    clientManager.removeClient(fakeSocket.socketId);
    assert.equal(clientManager.getClientCount(), 0);
  });

  it('can broadcast to all clients', function() {
    var fakeSocket = getFakeSocket();
    var fakeSocket2 = getFakeSocket();

    clientManager.addClient(fakeSocket);
    clientManager.addClient(fakeSocket2);

    clientManager.broadcast({testing: true});

    assert(fakeSocket.send.called);
    assert(fakeSocket2.send.called);
  });

});
