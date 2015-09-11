var assert = require('chai').assert;
var sinon = require('sinon');
var Client = require('../lib/client.js');
var _ = require('lodash');
var client;
var fakeSocket;

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

    it('sends the "connected" command', function() {
      assert.equal(fakeSocket.write.firstCall.args[0], JSON.stringify({command: 'connected'}));
    });

  });

  describe('.send()', function() {

    it('sends a command over the wire', function() {

      var commandObject = {
        command: 'test',
        hello: 'world'
      };

      client.send(commandObject);

      // The first call is the connected command.
      assert.equal(fakeSocket.write.secondCall.args[0], JSON.stringify(commandObject));

    });

    it('includes the command name if one is provided', function() {

      var commandObject = {
        hello: 'world'
      };

      client.send('test', commandObject);

      commandObject.command = 'test';

      // The first call is the connected command.
      assert.equal(fakeSocket.write.secondCall.args[0], JSON.stringify(commandObject));

    });

  });

  describe('.batchSend()', function() {

    it('sends every command in an array', function() {

      var commands = _.times(_.random(5, 10), function(index) {
        return {
          command: 'command' + index,
          data: index
        };
      });

      client.batchSend(commands);

      var writtenObject = JSON.parse(fakeSocket.write.secondCall.args[0]);

      assert(writtenObject.batch, 'The batch flag was not set');
      assert(_.isEqual(commands, writtenObject.commands));

    });

  });

  describe('.set() and .get()', function() {

    var types = [_.random(1, 200), 'testing', {hello: 'world'}];

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

      var stringCommand = JSON.stringify({command: 'test'});

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

      var handlers = _.times(sinon.stub, _.random(3, 10));
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
      var error;
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

      // Using .calledOnce to assert that only the 'connected' write happened.
      assert.isTrue(fakeSocket.write.calledOnce);
    });

    it('sends all queued commands', function() {
      client.setTickMode(true);
      client.send({command: 'test'});
      client.send({command: 'test2'});
      client.send({
        batch: true,
        commands: [
          {
            command: 'test3'
          },
          {
            command: 'test4'
          }
        ]
      });

      client.tick();

      assert.isTrue(fakeSocket.write.calledTwice);

      var sentObject = JSON.parse(fakeSocket.write.args[1]);
      assert.isTrue(sentObject.batch);
      assert.equal(sentObject.commands[0].command, 'test');
      assert.equal(sentObject.commands[1].command, 'test2');
      assert.equal(sentObject.commands[2].command, 'test3');
      assert.equal(sentObject.commands[3].command, 'test4');
    });

  });

});
