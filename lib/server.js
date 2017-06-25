'use strict';

const Client = require('./client.js');
const net = require('net');

class Server {

  constructor(socketHandler) {
    this.netServer = net.createServer(function(rawSocket) {
      const client = new Client(rawSocket);
      socketHandler(client);
    });
  }

  /**
   * Opens the server on the given port. Calls back when the server is open.
   * @param  {number}   port     The port to listen to
   * @param  {Function} callback The callback to run when open
   */
  listen(port, callback) {
    this.netServer.listen(port, callback);
  }

}

module.exports = Server;
