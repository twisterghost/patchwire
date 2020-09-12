const GMServer = require('../index.js').Server;
const ClientManager = require('../index.js').ClientManager;

const gameManager = new ClientManager();

gameManager.addCommandListener('register', (client) => {
  const playerId = Date.now().toString();
  console.log("Player registered", playerId);
  client.set('playerId', playerId);

  client.send('register', {
    playerId: playerId
  });
});

gameManager.addCommandListener('thing', (client) => {
  console.log('thing');
  client.send('thing', {});
});

gameManager.on('clientAdded', (client) => {
  console.log('Player connected.');
  client.send('joined', {
    motd: 'Never pet a dog on fire',
  });
});

const server = new GMServer(function(client) {
  gameManager.addClient(client);
});

server.listen(3001, function() {
  console.info('Server is running');
});
