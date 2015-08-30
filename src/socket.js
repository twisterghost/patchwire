var _ = require('lodash');
const TERMINATING_CHARACTER = '\0';
const DEBUG_MODE = process.env.GM_SERVER_DEBUG === 'true';

class Socket {

  constructor(socket) {
    this.socket = socket;
    this.dataHandlers = [];
    this.socketId = _.uniqueId();
    this.created = Date.now();
    this.data = {};

    socket.on('data', data => {

      const dataAsObject = Socket.getObjectFromRaw(data);

      if (DEBUG_MODE) {
        console.info(this.socketId, ' received: ', JSON.stringify(dataAsObject));
      }

      this.dataHandlers.forEach(handler => {
        handler(dataAsObject);
      })
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
      console.info(this.socketId, ' is sending: ', jsonToSend);
    }

    this.socket.write(jsonToSend);
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
    const trimmedData = rawSocketDataString.substr(0, terminatingIndex);
    const objectFromData = JSON.parse(trimmedData);
    return objectFromData;
  }

}

module.exports = Socket;
