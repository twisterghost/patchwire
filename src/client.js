'use strict';

var _ = require('lodash');
const TERMINATING_CHARACTER = '\0';
const DEBUG_MODE = process.env.GM_SERVER_DEBUG === 'true';

class Client {

  constructor(socket) {
    this.socket = socket;
    this.dataHandlers = [];
    this.clientId = _.uniqueId();
    this.created = Date.now();
    this.data = {};
    this.tickMode = false;
    this.tickModeQueue = [];

    socket.on('data', data => {

      const dataAsObject = Client.getObjectFromRaw(data);

      if (DEBUG_MODE) {
        console.info(this.clientId, ' received: ', JSON.stringify(dataAsObject));
      }

      this.dataHandlers.forEach(handler => {
        handler(dataAsObject);
      });
    });

    this.send({
      command: 'connected'
    });

  }

  /**
   * Sets tick mode on or off.
   * @param {boolean} onOff
   */
  setTickMode(onOff) {
    this.tickMode = onOff;
  }

  /**
   * Sends all stored commands when in tick mode
   */
  tick() {

    if (!this.tickMode) {
      throw new Error('Cannot tick when not in tick mode');
    }

    var command = {
      batch: true,
      commands: this.tickModeQueue
    };

    this.directSend(command);
    this.tickModeQueue = [];
  }

  /**
   * Sends a command. Command string is optional
   * @param {string} command
   * @param {object} data
   */
  send(command, data) {

    if (typeof data === 'undefined') {
      data = command;
    } else {
      data.command = command;
    }

    if (this.tickMode) {

      // If this is a batch send, put all of the commands into the queue.
      if (data.batch) {
        data.commands.forEach(command => {
          this.tickModeQueue.push(command);
        });
      } else {
        this.tickModeQueue.push(data);
      }

    } else {
      if (DEBUG_MODE) {
        console.info(this.clientId, ' is sending: ', data);
      }
      this.directSend(data);
    }

  }

  /**
   * Directly writes to the wire
   * @param  {object} command
   */
  directSend(command) {
    this.socket.write(JSON.stringify(command));
  }

  /**
   * Sends a list of commands together at once
   * @param  {array} commandList
   */
  batchSend(commandList) {
    this.send({
      batch: true,
      commands: commandList
    });
  }

  /**
   * Sets an arbitrary value on this object
   * @param {string} key
   * @param {mixed} value
   */
  set(key, value) {
    this.data[key] = value;
  }

  /**
   * Returns stored data on this object
   * @param  {string} key
   * @return {mixed}
   */
  get(key) {
    return this.data[key];
  }

  /**
   * Registers an event handler on the underlying socket of this client
   * @param  {string} eventName
   * @param  {function} handler
   */
  on(eventName, handler) {
    this.socket.on(eventName, handler);
  }

  /**
   * Registers a handler for when this socket receives data
   * @param  {function} handler
   */
  onData(handler) {
    this.dataHandlers.push(handler);
  }

  /**
   * Gets a javascript object from an input buffer containing json
   * @param  {Buffer} data
   * @return {object}
   */
  static getObjectFromRaw(data) {
    const rawSocketDataString = data.toString('ascii');
    const terminatingIndex = rawSocketDataString.indexOf(TERMINATING_CHARACTER);
    var trimmedData;
    if (terminatingIndex > -1) {
      trimmedData = rawSocketDataString.substr(0, terminatingIndex);
    } else {
      trimmedData = rawSocketDataString;
    }
    const objectFromData = JSON.parse(trimmedData);
    return objectFromData;
  }

}

module.exports = Client;
