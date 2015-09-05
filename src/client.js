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

  send(command, data) {

    if (typeof data === 'undefined') {
      data = command;
    } else {
      data.command = command;
    }

    const jsonToSend = JSON.stringify(data);

    if (DEBUG_MODE) {
      console.info(this.clientId, ' is sending: ', jsonToSend);
    }

    this.socket.write(jsonToSend);
  }

  batchSend(commandList) {
    this.send({
      batch: true,
      commands: commandList
    });
  }

  set(key, value) {
    this.data[key] = value;
  }

  get(key) {
    return this.data[key];
  }

  on(eventName, handler) {
    this.socket.on(eventName, handler);
  }

  onData(handler) {
    this.dataHandlers.push(handler);
  }

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
