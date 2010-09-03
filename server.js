var express = require('express'),
    sys = require('sys'),
    http = require('http'),
    app = express.createServer(),
    io = require('socket.io');
    server = http.createServer(),
    socket = io.listen(server),
    json = JSON.stringify,
    log = sys.puts,
    World = require(__dirname+"/lib/world").World,
    actions = [
      'create_robot',
      'create_tower',
      'launch_wave',
      'damage_robot',
      'lose_life',
      'upgrade_tower',
      'upgrade_robots',
      'fire'
    ];

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

socket.on('connection', function(client) {
  var game = World.get_game();
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

    if(!game.ready) {
      log('Can not start yet');
      return false;
    } else if(game.finished) {
      log('Finished');
      return false;
    }
    var player = game.player(client);
    player[request.action](request);
  });

  client.on('disconnect', function() {
    game.disconnect(client.sessionId);
  });
});

setInterval(function() {
  if (World.games) {
    World.games.forEach(function(game) {
      if (game && game.players && game.players.length == 2) {
        game.players.forEach(function(player) {
          player.cash_received({ amount : 25 });
        });
      }
    });
  }
}, 5000);

var
net = require('net');
net.createServer(function(socket){
  socket.write('<?xml version="1.0"?>\n');
  socket.write('<!DOCTYPE cross-domain-policy SYSTEM "http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd">\n');
  socket.write('<cross-domain-policy>\n');
  socket.write('<allow-access-from domain="*" to-ports="*"/>\n');
  socket.write('</cross-domain-policy>\n');
  socket.end();
}).listen(843, '127.0.0.1');
