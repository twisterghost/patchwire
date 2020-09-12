'use strict';

const assert = require('chai').assert;
const sinon = require('sinon');
const Client = require('../lib/client.js');
const _ = require('lodash');
let client;
let fakeSocket;
const TERM_STR = '^X|X^';

function getFakeNetSocket() {
  return {
    on: sinon.stub(),
    write: sinon.stub()
  };
}

describe('Client', function() {

  beforeEach(function() {
    fakeSocket = getFakeNetSocket();
    client = new Client(fakeSocket);
  });

  describe('constructor', function() {

    it('sets up data handling on the socket', function() {
      assert(fakeSocket.on.called);
      assert.equal(fakeSocket.on.firstCall.args[0], 'data');
    });

  });

  describe('.send()', function() {

    it('sends a command over the wire', function() {

      const commandObject = {
        command: 'test',
        hello: 'world'
      };

      client.send(commandObject);

      assert.equal(fakeSocket.write.firstCall.args[0], JSON.stringify(commandObject) + TERM_STR);

    });

    it('includes the command name if one is provided', function() {

      const commandObject = {
        hello: 'world'
      };

      client.send('test', commandObject);
      commandObject.command = 'test';

      assert.equal(fakeSocket.write.firstCall.args[0], JSON.stringify(commandObject) + TERM_STR);
    });

  });

  describe('.set() and .get()', function() {

    const types = [1, true, 'testing', {hello: 'world'}];

    types.forEach(function(value) {
      it('can save and retrieve a(n) ' + typeof value, function() {
        client.set('testValue', value);
        assert.deepEqual(client.get('testValue'), value);
      });
    });

  });

  describe('.on', function() {

    it('sets an event listener on the socket', function() {
      client.on('test', sinon.stub());

      assert(fakeSocket.on.called, 'The event listener was not attached to the socket');
    });

  });

  describe('.onData', function() {

    it('adds a data handler to the object', function() {
      client.onData(sinon.stub());
      assert.isAbove(client.dataHandlers.length, 0);
    });

    it('runs the registered functions when data arrives', function() {

      const stringCommand = JSON.stringify({command: 'test'});

      fakeSocket = {
        dataHandler: sinon.stub(),
        fireData: function() {
          this.dataHandler(new Buffer(stringCommand, 'ascii'));
        },
        on: function(eventName, handler) {
          this.dataHandler = handler;
        },
        write: sinon.stub()
      };

      client = new Client(fakeSocket);

      const handlers = _.times(sinon.stub, 10);
      handlers.forEach(function(handler) {
        client.onData(handler);
      });

      fakeSocket.fireData();

      handlers.forEach(function(handler) {
        assert(handler.called);
        assert(handler.calledWith(JSON.stringify({command: 'test'})));
      });

    });

  });

  describe('.setTickMode', function() {

    it('sets the tick mode on or off', function() {

      client.setTickMode(true);
      assert.isTrue(client.tickMode);

      client.setTickMode(false);
      assert.isFalse(client.tickMode);

    });

  });

  describe('.tick', function() {

    it('throws an error when not in tick mode', function() {
      let error;
      try {
        client.tick();
      } catch (e) {
        error = e;
      }

      assert.instanceOf(error, Error);
    });

    it('does not send anything when nothing has been queued', function() {
      client.setTickMode(true);
      client.tick();

      assert.isFalse(fakeSocket.write.called);
    });

    it('sends all queued commands', function() {
      client.setTickMode(true);
      client.send({command: 'test'});
      client.send({command: 'test2'});

      client.tick();

      assert.isTrue(fakeSocket.write.calledTwice);
    });
  });

});
