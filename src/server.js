var Socket = require('./socket.js');
var net = require('net');

class Server {

  constructor(socketHandler) {
    this.netServer = net.createServer(function(rawSocket) {
      var clientSocket = new Socket(rawSocket);
      socketHandler(clientSocket);
    });
  }

  listen(port, callback) {
    this.netServer.listen(port, callback);
  }

}

module.exports = Server;
