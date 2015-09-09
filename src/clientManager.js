'use strict';

var _ = require('lodash');
const DEBUG_MODE = process.env.GM_SERVER_DEBUG === 'true';

class ClientManager {

  constructor() {
    this.clients = [];
    this.commandHandlers = {};
    this.eventHandlers = {};
    this.persistedData = {};
  }

  getClients() {
    return this.clients;
  }

  getClientCount() {
    return this.clients.length;
  }

  set(key, value) {
    this.persistedData[key] = value;
  }

  get(key) {
    return this.persistedData[key];
  }

  addClient(client) {

    client.onData(data => {
      this.handleIncomingCommand(client, data);
    });

    client.on('close', () => {
      this.fire('clientDropped', client);
      this.removeClient(client.clientId);
    });

    client.on('error', error => {
      console.error(error);
    });

    this.clients.push(client);
    this.fire('clientAdded', client);
  }

  removeClient(clientId) {

    var removed = _.remove(this.clients, function(client) {
      return client.clientId === clientId;
    });

    if (removed.length > 0) {
      return removed[0];
    } else {
      return undefined;
    }
  }

  broadcast(command, data) {

    if (typeof data === 'undefined') {
      data = command;
    } else {
      data.command = command;
    }

    this.clients.forEach(client => {
      client.send(data);
    });
  }

  handleIncomingCommand(client, data) {
    this.fire('commandReceived', {client: client, data: data});

    if (this.commandHandlers.hasOwnProperty(data.command)) {
      this.commandHandlers[data.command].forEach(handler => {
        handler(client, data);
      });
    } else if (DEBUG_MODE) {
      console.warn('No handler defiend for: ', data.command);
    }
  }

  addCommandListener(command, handler) {
    // If there is a command listener for this command already, push.
    if (this.commandHandlers.hasOwnProperty(command)) {
      this.commandHandlers[command].push(handler);
    } else {
      this.commandHandlers[command] = [handler];
    }
  }

  on(eventName, handler) {
    // If there is a event listener for this event already, push.
    if (this.eventHandlers.hasOwnProperty(eventName)) {
      this.eventHandlers.push(handler);
    } else {
      this.eventHandlers[eventName] = [handler];
    }
  }

  fire(eventName, data) {
    if (this.eventHandlers.hasOwnProperty(eventName)) {
      this.eventHandlers[eventName].forEach(function(handler) {
        if (typeof data !== 'undefined') {
          handler(data);
        } else {
          handler();
        }
      });
    }
  }

}

module.exports = ClientManager;
