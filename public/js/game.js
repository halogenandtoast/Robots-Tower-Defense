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

    if (socket.connect()) {
      Game.map    = new Map();
      Game.socket = socket;
      Game.bindEventListeners();

      setInterval(function() {
        Game.map.render();
      }.bind(this), 1000 / 30);
    }
  },

  onMessage: function(message) {
    if (!Game.session_id) {
      Game.session_id = Game.socket.transport.sessionid;
    }

    message = JSON.parse(message);

    switch (message.action) {
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
    $('unit-count').innerHTML = 0;
    Game.send({ 'action' : 'launch_wave' });
  },

  send: function(data) {
    Game.socket.send(JSON.stringify(data));
  }
};
