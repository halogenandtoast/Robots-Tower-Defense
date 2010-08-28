var express = require('express'),
    sys = require('sys'),
    http = require('http'),
    app = express.createServer(),
    io = require('socket.io');
    server = http.createServer(),
    socket = io.listen(server),
    json = JSON.stringify,
    log = sys.puts,
    Game = require(__dirname+"/lib/game").Game,
    game = new Game(),
    actions = ['create_unit', 'launch_wave', 'lose_life'];

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

function player(client) {
  return players[client.sessionId];
}
socket.on('connection', function(client) {
  game.add_player(client);

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

    var player = game.player(client);

    if(request.action == 'create_unit') {
      player.create_unit();
    } else if (request.action == 'launch_wave') {
      player.launch_wave();
    } else if (request.action == 'lose_life') {
      player.lose_life();
    }
  });
});
