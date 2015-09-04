var GMServer = require('./index.js').Server;
var ClientManager = require('./index.js').ClientManager;

var commandHandlers = {

  register: function(socket) {
    var playerId = Date.now().toString();
    socket.set('playerId', playerId);

    socket.send('register', {
      playerId: playerId
    });
  }

};

var gameManager = new ClientManager();

gameManager.addCommandListener('register', commandHandlers.register);

var server = new GMServer(function(client) {
  gameManager.addClient(client);
});

server.listen(3001, function() {
  console.info('Server is running');
});
