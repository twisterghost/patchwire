const GMServer = require('../index.js').Server;
const ClientManager = require('../index.js').ClientManager;

const gameManager = new ClientManager();

gameManager.addCommandListener('register', (client) => {
  const playerId = Date.now().toString();
  client.set('playerId', playerId);

  client.send('register', {
    playerId: playerId
  });
});

gameManager.on('clientAdded', (client) => {
  console.log('Player connected.');

  client.send('joined', {
    motd: 'Never pet a dog on fire'
  });
});

gameManager.on('clientDropped', ({ client, reason }) => {
  console.log('Client dropped:', client.clientId, reason);
});

const server = new GMServer(function (client) {
  client.addCommandListener('register', () => {
    console.log('Client is registering.');
  });

  gameManager.addClient(client);
});

server.listen(3001, function () {
  console.info('Server is running');
});
