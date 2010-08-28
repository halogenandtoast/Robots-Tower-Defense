var express = require('express'),
    sys = require('sys'),
    http = require('http'),
    app = express.createServer(),
    io = require('socket.io');
    server = http.createServer(),
    socket = io.listen(server),
    json = JSON.stringify,
    log = sys.puts,
    Player = require(__dirname+'/lib/player').Player,
    actions = ['create_unit', 'launch_wave', 'lose_life'],
    waves = {},
    upgrades = {};
    players = {};

app.configure(function() {
  app.use(express.staticProvider(__dirname + '/public'));
});

app.get('/hai', function (req, res) {
  res.send('oh hai');
});

var port = process.argv.length == 3 ? parseInt(process.argv[2]) : 80
app.listen(port, '0.0.0.0');

server.listen(8024);


function invalidRequest(request) {
  return actions.indexOf(request.action) == -1;
}

function createResponse(client, action, object) {
  object.id = client.sessionId;
  object.action = action;
  return object;
}

function relay(client, action, object) {
  response = createResponse(client, action, object);
  client.send(json(response));
  client.broadcast(json(response));
}

function player(client) {
  return players[client.sessionId];
}
socket.on('connection', function(client) {
  players[client.sessionId] = new Player();

  client.on('message', function(message) {
    try {
      request = JSON.parse(message.replace('<', '&lt;').replace('>', '&gt;'));
    } catch (SyntaxError) {
      log('Invalid JSON:');
      log(message);
      return false;
    }

    if(invalidRequest(request)) {
      log('Invalid request:' + "\n" + message);
      return false;
    }

    var _player = player(client);

    if(request.action == 'create_unit') {
      _player.wave.units.push('1');
      relay(client, 'unit_created', { unit_count: _player.wave.units.length });
    } else if (request.action == 'launch_wave') {
      wave = _player.wave.hash();
      _player.new_wave();
      relay(client, 'wave_launched', wave);
    } else if (request.action == 'lose_life') {
      _player.lose_life();
      relay(client, 'life_lost', { life: _player.life });
    }
  });
});
