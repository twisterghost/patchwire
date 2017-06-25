# Patchwire
Multiplayer game server framework for Node.js

[![Circle CI](https://circleci.com/gh/twisterghost/patchwire.svg?style=svg)](https://circleci.com/gh/twisterghost/patchwire)

## Install
`npm install patchwire`

## Use
```JavaScript
// MyGameServer.js
const Server = require('patchwire').Server;
const ClientManager = require('patchwire').ClientManager;

const gameLobby = new ClientManager();
gameLobby.on('clientAdded', function() {
    gameLobby.broadcast('chat', {
        message: 'A new player has joined the game.'
    });
});

const server = new Server(function(client) {
  gameLobby.addClient(client);
});

server.listen(3001);
```

## Documentation

See [the patchwire Github wiki](https://github.com/twisterghost/patchwire/wiki)

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

## Clients

Patchwire is unassuming about the client side as it speaks primarily through JSON strings encoded over the wire. If you do not see your preferred client side below, creating your own client package is strongly encouraged, as Patchwire is built to be as easy as possible to implement. More client packages will come over time.

### List of client packages:

* [GameMaker: Studio](https://github.com/twisterghost/patchwire-gm)
* [iOS](https://github.com/VictorBX/patchwire-ios)

