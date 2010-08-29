var Game = {
  addDialogue: function(html, clearMap) {
    var
    dialogue = document.createElement('div');
    dialogue.innerHTML = html;
    dialogue.className = 'dialogue';

    if (clearMap) {
      $('#map a').forEach(function(element) {
        element.parentNode.removeChild(element);
      });
    }

    $('#map')[0].appendChild(dialogue);
    $('.dialogue')[0].addEventListener('click', function(event) {
      Game.removeDialogue();

      event.preventDefault();
    });
  },

  removeDialogue: function() {
    var element = $('.dialogue')[0];

    if (element) {
      element.parentNode.removeChild(element);
    }
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
    Game.removeDialogue();
    Game.addDialogue('<h2>Disconnected</h2><p>You were disconnected.</p><a href="/">Play Again</a>', true);
  },

  onReady: function(top_player_id, bottom_player_id) {
    Game.map = new Map(top_player_id, bottom_player_id);
    Game.removeDialogue();

    var player;
    var other;

    if (Game.session_id == top_player_id) {
      other  = $('#player-2')[0];
      player = $('#player-1')[0];
    } else {
      other  = $('#player-1')[0];
      player = $('#player-2')[0];
    }

    $('a', other).forEach(function(element) {
      element.parentNode.removeChild(element);
    });

    $('.add-robot-1', player)[0].addEventListener('click', function(event) {
      Game.addRobot();

      event.preventDefault();
    });

    $('.launch-wave', player)[0].addEventListener('click', function(event) {
      Game.launchWave();

      event.preventDefault();
    });

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

        $('.player').forEach(function(element) {
          element.style.display = 'block';
        });

        Game.addDialogue('<img src="/images/help.png"><a href="#">Start</a>');
      break;

      case 'game_finished':
        if (Game.session_id == message.id) {
          Game.addDialogue('<h2>Defeat!</h2><p>You were defeated.</p><a href="/">Play Again</a>', true);
        } else {
          Game.addDialogue('<h2>Victory!</h2><p>You are victorious.</p><a href="/">Play Again</a>', true);
        }
      break;

      case 'game_disbanded':
        Game.removeDialogue();

        Game.addDialogue('<h2>Victory!</h2><p>Your opponent disconnected.</p><a href="/">Play Again</a>', true);
      break;

      case 'life_lost':
        if (Game.session_id == message.id) {
          var element;

          if (message.id == Game.map.topPlayer) {
            element = $('#player-1 .lives')[0];
          } else {
            element = $('#player-2 .lives')[0];
          }

          element.innerHTML = parseInt(element.innerHTML, 10) - 1;
        }
      break;

      case 'tower_created':
        var position = message.position;
        var tower    = new Tower({
          x : 4 + (((position - 1) % 20) * 40),
          y : 125 + (160 * Math.round((position - ((position - 1) % 20)) / 20)),
          session_id : message.id,
          serial_number: message.serial_number,
          rate: message.rate,
          range: message.range
        });
        Game.map.addTower(tower, position);
      break;

      case 'robot_created':
        var element;

        if (message.id == Game.map.topPlayer) {
          element = $('#player-1 .robot-1-count')[0];
        } else {
          element = $('#player-2 .robot-1-count')[0];
        }

        element.innerHTML = message.robot_count;
        element.style.display = 'block';
      break;

      case 'robot_destroyed':
        Game.map.removeRobotBySerialNumber(message.serial_number);
      break;

      case 'wave_launched':
        var element;

        if (message.id == Game.map.topPlayer) {
          element = $('#player-1 .robot-1-count')[0];
        } else {
          element = $('#player-2 .robot-1-count')[0];
        }

        element.style.display = 'none';

        for (var i = 0, l = message.robots.length; i < l; i++) {
          (function() {
            var x     = -1;
            var y     = 367;
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
        if (message.id == Game.map.topPlayer) {
          $('#player-1 .cash')[0].innerHTML = '$' + message.amount;
        } else {
          $('#player-2 .cash')[0].innerHTML = '$' + message.amount;
        }
      break;
    }

    console.log(JSON.stringify(message));
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
