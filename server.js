var express = require('express'),
    sys = require('sys'),
    http = require('http'),
    app = express.createServer(),
    io = require('socket.io');
    server = http.createServer(),
    socket = io.listen(server),
    json = JSON.stringify,
    log = sys.puts,
    actions = ['create_unit'],
    waves = {},
    upgrades = {};
    player = {};

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
  response = createResponse(action, object);
  client.send(json(response));
  client.broadcast(json(response));
}

socket.on('connection', function(client) {
  player[client.sessionId] = {
    life: 10,
    upgrades: {'speed': 1},
    wave: {'units': [], 'speed': 1}
  };

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

    if(request.action == 'create_unit') {
      player[client.sessionId]['wave']['units'].push('1');
      relay(client, 'unit_created', { unit_count: player[client.sessionId]['wave']['units'].length });
    } else if (request.action == 'launch_wave') {
      relay(client, 'wave_launched', player[client.sessionId]['wave'].clone());
    } else if (request.action == 'lose_life') {
      player[client.sessionId]['life']--;
      relay(client, 'life_lost', { life: player[client.sessionId]['life'] });
    }
  });
});
