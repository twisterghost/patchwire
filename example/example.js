const GMServer = require('../index.js').Server;
const ClientManager = require('../index.js').ClientManager;

const gameManager = new ClientManager();

gameManager.addCommandListener('register', (client, data) => {
  client.set('username', data.username);

  client.send('register', {
    registered: true,
    username: data.username,
  });

  console.log(client.clientId, 'has registered as', data.username);
});

gameManager.on('clientAdded', (client) => {
  console.log('Player connected. Client id:', client.clientId);

  client.send('welcome', {
    motd: 'Never pet a dog on fire'
  });
});

gameManager.on('clientDropped', ({ client, reason }) => {
  console.log('Client dropped:', client.clientId, reason);
});

const server = new GMServer(function (client) {
  gameManager.addClient(client);
});

server.listen(3001, function () {
  console.info('Server is running');
});
