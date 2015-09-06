# Patchwire
Multiplayer game server framework for Node.js

[![Circle CI](https://img.shields.io/circleci/project/twisterghost/patchwire/master.svg)](https://circleci.com/gh/twisterghost/patchwire)

## Quick Start

### Install
`npm install patchwire`

### Use
```JavaScript
// MyGameServer.js
var Server = require('patchwire').Server;
var ClientManager = require('patchwire').ClientManager;

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

## Documentation

You can find all of the documentation for Patchwire at [the wiki for patchwire](https://github.com/twisterghost/patchwire/wiki)

## About

Patchwire is a server framework designed for multiplayer games. Originally built to work with GameMaker: Studio's networking code, it has been standardized to be unassuming about the client end framework.

Patchwire uses a paradigm of sending "commands" to clients, and in turn, listening for commands from the client. A command is nothing more than a string identifier, and some data. A command looks like this:

```JavaScript
{
  command: 'updatePosition',
  x: 200,
  y: 120
}
```

## Client Side

Patchwire speaks JSON via a networking socket. All you need to connect to a Patchwire server is the ability to connect to a socket. Currently, Patchwire only has official support for GameMaker as a client library, the code for which can be found [here](https://github.com/twisterghost/patchwire-gm)
