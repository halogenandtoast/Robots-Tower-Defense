var Game = {
  bindEventListeners: function() {
    $('add-unit').addEventListener('click', function(event) {
      Game.addUnit();

      event.preventDefault();
    });

    $('launch-wave').addEventListener('click', function(event) {
      Game.launchWave();

      event.preventDefault();
    });
  },

  connect: function() {
    var
    socket = new io.Socket(window.location.hostname, { port : 8024 });
    socket.on('message', Game.onMessage);
    socket.on('disconnect', Game.onDisconnect);
    socket.connect();

    Game.socket = socket;
  },

  onDisconnect: function() {
    $('hud').style.display = 'none';
    $('waiting').style.display = 'block';
    $('waiting').innerHTML = 'You were disconnected. Reload to play again.';
  },

  onReady: function() {
    Game.map    = new Map();
    Game.bindEventListeners();

    $('hud').style.display = 'block';
    $('waiting').style.display = 'none'

    setInterval(function() {
      Game.map.render();
    }.bind(this), 1000 / 30);
  },

  onMessage: function(message) {
    if (!Game.session_id) {
      Game.session_id = Game.socket.transport.sessionid;
    }

    message = JSON.parse(message);

    switch (message.action) {
      case 'game_ready':
        Game.onReady();
      break;

      case 'game_finished':
        if (Game.session_id == message.id) {
          $('waiting').innerHTML = 'You lost! Reload to play again.';
        } else {
          $('waiting').innerHTML = 'You won! Reload to play again.';
        }

        $('hud').style.display = 'none';
        $('waiting').style.display = 'block';
      break;

      case 'game_disbanded':
        $('hud').style.display = 'none';
        $('waiting').style.display = 'block';
        $('waiting').innerHTML = 'Your opponent disconnected. Reload to play again.';
      break;

      case 'life_lost':
        if (Game.session_id == message.id) {
          var
          element = $('health');
          element.innerHTML = parseInt(element.innerHTML, 10) - 1;
        }
      break;

      case 'unit_created':
        if (Game.session_id == message.id) {
          $('unit-count').innerHTML = message.unit_count;
        }
      break;

      case 'wave_launched':
        if (Game.session_id == message.id) {
          $('unit-count').innerHTML = 0;
        }

        for (var i = 0, l = message.units.length; i < l; i++) {
          setTimeout(function() {
            var x     = -1;
            var y     = 7;
            var dX    = 1;
            var image = 1;

            if (message.id != Game.session_id) {
              x     = 26;
              y     = 8;
              dX    = -1;
              image = 2;
            }

            var unit = new Unit({
              x          : x,
              y          : y,
              dX         : dX,
              image      : image,
              speed      : message.speed,
              session_id : message.id
            });

            Game.map.addUnit(unit);
          }, 1000 * i);
        }
      break;
    }

    console.log(message);
  },

  addUnit: function() {
    Game.send({ 'action' : 'create_unit' });
  },

  launchWave: function() {
    Game.send({ 'action' : 'launch_wave' });
  },

  send: function(data) {
    Game.socket.send(JSON.stringify(data));
  }
};
