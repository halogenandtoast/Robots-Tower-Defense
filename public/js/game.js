var Game = {
  bindEventListeners: function() {
    $('add-robot').addEventListener('click', function(event) {
      Game.addRobot();

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

  onReady: function(top_player_id, bottom_player_id) {
    console.log(top_player_id);
    console.log(bottom_player_id);
    Game.map    = new Map(top_player_id, bottom_player_id);
    Game.bindEventListeners();

    $('hud').style.display = 'block';
    $('waiting').style.display = 'none'

    setInterval(function() {
      Game.map.cycle();
    }.bind(this), 1000 / 30);
  },

  onMessage: function(message) {
    if (!Game.session_id) {
      Game.session_id = Game.socket.transport.sessionid;
    }

    message = JSON.parse(message);

    switch (message.action) {
      case 'game_ready':
        Game.onReady(message.top_player_id, message.bottom_player_id);
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

      case 'tower_created':
        var position = message.position;
        var tower    = new Tower({
          x : 4 + ((position % 20) * 40) - 40,
          y : 125 + (160 * Math.round((position - (position % 20)) / 20)),
          session_id : message.id,
          serial_number: message.serial_number
        });

        Game.map.towers.push(tower);
      break;

      case 'robot_created':
        if (Game.session_id == message.id) {
          $('robot-count').innerHTML = message.robot_count;
        }
      break;

      case 'robot_destroyed':
        Game.map.removeRobotBySerialNumber(message.serial_number);
      break;

      case 'wave_launched':
        if (Game.session_id == message.id) {
          $('robot-count').innerHTML = 0;
        }

        for (var i = 0, l = message.robots.length; i < l; i++) {
          (function() {
            var x     = -1;
            var y     = 360;
            var dX    = 1;
            var image = 1;

            if (message.id != Game.map.bottomPlayer) {
              x     = 801;
              y     = 200;
              dX    = -1;
              image = 2;
            }

            var robot = new Robot({
              x             : x,
              y             : y,
              dX            : dX,
              image         : image,
              speed         : message.robots[i].speed,
              session_id    : message.id,
              serial_number : message.robots[i].serial_number
            });

            setTimeout(function() {
              Game.map.addRobot(robot);
            }, 1000 * i);
          })();
        }
      break;
      case 'cash_amount':
        if (Game.session_id == message.id) {
          $('cash').innerHTML = '$'+message.amount;
        }
      break;
    }

    console.log(message);
  },

  addRobot: function() {
    Game.send({ 'action' : 'create_robot' });
  },

  launchWave: function() {
    Game.send({ 'action' : 'launch_wave' });
  },

  send: function(data) {
    Game.socket.send(JSON.stringify(data));
  }
};
