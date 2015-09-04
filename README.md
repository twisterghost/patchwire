# Stormwind
Multiplayer game server framework for Node.js

## Quick Start

`npm install stormwind`

```JavaScript
// MyGameServer.js
var Server = require('../index.js').Server;
var ClientManager = require('../index.js').ClientManager;

var server = new Server();
var gameLobby = new ClientManager();
gameLobby.on('clientAdded', function() {
    gameLobby.broadcast('chat', {
        message: 'A new player has joined the game.'
    });
});

var server = new Server(function(client) {
  gameLobby.addClient(client);
});

server.listen(3001);
```
