'use strict';

var Client = require('./client.js');
var net = require('net');

class Server {

  constructor(socketHandler) {
    this.netServer = net.createServer(function(rawSocket) {
      var client = new Client(rawSocket);
      socketHandler(client);
    });
  }

  listen(port, callback) {
    this.netServer.listen(port, callback);
  }

}

module.exports = Server;
