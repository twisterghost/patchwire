'use strict';

const _ = require('lodash');
const TERMINATING_CHARACTER = '\0';
const DEBUG_MODE = process.env.GM_SERVER_DEBUG === 'true';
const TERM_STR = '\n\t\n';

class Client {
  constructor (socket) {
    this.socket = socket;
    this.dataHandlers = [];
    this.commandHandlers = {};
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

      // Low level handlers
      this.dataHandlers.forEach(handler => {
        handler(dataAsObject);
      });

      // Client level command handlers
      if (this.commandHandlers[dataAsObject.command]) {
        this.commandHandlers[dataAsObject.command].forEach(handler => {
          handler(dataAsObject);
        });
      }
    });

    socket.on('error', error => {
      if (DEBUG_MODE) {
        console.error(error);
      }
    });
  }

  /**
   * Disconnects the client
   */
  disconnect () {
    this.socket.destroy();
  }

  /**
   * Sends a command. Command string is optional
   * @param {string} command
   * @param {object} data
   */
  send (command, data) {
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
  directSend (command) {
    this.socket.write(JSON.stringify(command) + TERM_STR);
  }

  /**
   * Sets an arbitrary value on this object
   * @param {string} key
   * @param {mixed} value
   */
  set (key, value) {
    this.data[key] = value;
  }

  /**
   * Returns stored data on this object
   * @param  {string} key
   * @return {mixed}
   */
  get (key) {
    return this.data[key];
  }

  /**
   * Registers an event handler on the underlying socket of this client
   * @param  {string} eventName
   * @param  {function} handler
   */
  on (eventName, handler) {
    this.socket.on(eventName, handler);
  }

  /**
   * Registers a handler for when this socket receives data
   * @param  {function} handler
   */
  onData (handler) {
    this.dataHandlers.push(handler);
  }

  /**
   * Registers a callback function for when a given command is sent in by this client
   * @param {string} command   The command to listen for
   * @param {function} handler A callback to run when the command is received
   */
  addCommandListener (command, handler) {
    // If there is a command listener for this command already, push.
    if (this.commandHandlers[command]) {
      this.commandHandlers[command].push(handler);
    } else {
      this.commandHandlers[command] = [handler];
    }
  }

  /**
   * Removes a registered callback function for when a given command is sent in by this client
   * @param {string} command   The command to listen for
   * @param {function} handler The function to remove
   */
  removeCommandListener (command, handler) {
    if (this.commandHandlers[command]) {
      this.commandHandlers[command] = this.commandHandlers[command].filter(fn => fn !== handler);
    }
  }

  /**
   * Sets tick mode on or off.
   * @param {boolean} onOff
   */
  setTickMode (onOff) {
    this.tickMode = onOff;
  }

  /**
   * Sends all stored commands when in tick mode
   */
  tick () {
    if (!this.tickMode) {
      throw new Error('Cannot tick when not in tick mode');
    }

    if (this.tickModeQueue.length !== 0) {
      this.tickModeQueue.forEach(command => {
        this.directSend(command);
      });
    }

    this.tickModeQueue = [];
  }

  /**
   * Gets a javascript object from an input buffer containing json
   * @param  {Buffer} data
   * @return {object}
   */
  static getObjectFromRaw (data) {
    const rawSocketDataString = data.toString('ascii');
    const terminatingIndex = rawSocketDataString.indexOf(TERMINATING_CHARACTER);
    let trimmedData;
    if (terminatingIndex > -1) {
      trimmedData = rawSocketDataString.substr(0, terminatingIndex);
    } else {
      trimmedData = rawSocketDataString;
    }
    if (trimmedData === null || trimmedData.trim() === '') {
      trimmedData = '{"command": "missingSocketDataString"}';
    }
    const objectFromData = JSON.parse(trimmedData);
    return objectFromData;
  }
}

module.exports = Client;
