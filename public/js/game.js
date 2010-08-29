var Game = {
  addEmptyDialogue: function(html) {
    var dialogue = document.createElement('div');
    dialogue.innerHTML = html;
    dialogue.className = 'dialogue empty';
    $('body')[0].appendChild(dialogue);
  },

  addDialogue: function(html, clearMap, callback) {
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
      if(callback) {
        callback();
        event.preventDefault();
      }
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
      Game.addRobot('type1');
      event.preventDefault();
    });

    $('.add-robot-2', player)[0].addEventListener('click', function(event) {
      Game.addRobot('type2');
      event.preventDefault();
    });

    $('.upgrade-robot-1', player)[0].addEventListener('click', function(event) {
      Game.upgradeRobot('type1');
      event.preventDefault();
    });

    $('.upgrade-robot-2', player)[0].addEventListener('click', function(event) {
      Game.upgradeRobot('type2');
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

  displayHelp: function(button_text, callback) {
    Game.addDialogue('<img src="/images/help.png"><a href="#help">'+button_text+'</a>', false, callback);
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


        $('#player-1 .cash')[0].innerHTML = '$' + message.cash;
        $('#player-2 .cash')[0].innerHTML = '$' + message.cash;

        Game.robots = message.robots;
        Game.towers = message.towers;
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
        var element;

        if (message.id == Game.map.topPlayer) {
          element = $('#player-1 .lives')[0];
        } else {
          element = $('#player-2 .lives')[0];
        }

        element.innerHTML = parseInt(element.innerHTML, 10) - 1;
      break;

      case 'tower_created':
        var position = message.position;
        var tower    = new Tower({
          x : 4 + (((position - 1) % 20) * 40),
          y : 125 + (160 * Math.round((position - ((position - 1) % 20)) / 20)),
          session_id : message.id,
          serial_number: message.serial_number,
          rate: message.rate,
          range: message.range,
          image: message.tower_type == 'type1' ? 1 : 2,
          level: message.level,
          damage: message.damage,
          upgrade_cost: message.upgrade_cost
        });
        Game.map.addTower(tower, position);
      break;

      case 'tower_upgraded':
        for (var i = 0, l = Game.map.towers.length; i < l; i++) {
          var tower = Game.map.towers[i];

          if (tower && tower.serial_number == message.serial_number) {
            tower.rate = message.rate;
            tower.range = message.range;
            tower.damage = message.damage;
            tower.level = message.level;
            tower.upgrade_cost = message.upgrade_cost;
            break;
          }
        }
      break;

      case 'robot_created':
        var element;
        var className = message.robot_type == 'type1' ? '.robot-1-count' : '.robot-2-count';

        if (message.id == Game.map.topPlayer) {
          element = $('#player-1 ' + className)[0];
        } else {
          element = $('#player-2 ' + className)[0];
        }

        element.innerHTML = message.robot_count;
        element.style.display = 'block';
      break;

      case 'robot_destroyed':
        Game.map.removeRobotBySerialNumber(message.serial_number);
      break;

      case 'robots_upgraded':
        var className = message.type == 'type1' ? '.robot-1-level' : '.robot-2-level';

        if (message.id == Game.map.topPlayer) {
          element = $('#player-1 ' + className + ' span')[0];
        } else {
          element = $('#player-2 ' + className + ' span')[0];
        }

        element.innerHTML = message.level;
      break;

      case 'wave_launched':
        var elements;

        if (message.id == Game.map.topPlayer) {
          elements = $('#player-1 .robot-1-count, #player-1 .robot-2-count');
        } else {
          elements = $('#player-2 .robot-1-count, #player-2 .robot-2-count');
        }

        elements.forEach(function(element) {
          element.style.display = 'none';
        });

        for (var i = 0, l = message.robots.length; i < l; i++) {
          (function() {
            var x  = -1;
            var y  = 367;
            var dX = 1;
            var robot = message.robots[i];

            if (message.id != Game.map.bottomPlayer) {
              x  = 801;
              y  = 200;
              dX = -1;
            }

            var robot = new Robot({
              x             : x,
              y             : y,
              dX            : dX,
              image         : robot.type == 'type1' ? 1 : 2,
              speed         : robot.speed,
              session_id    : message.id,
              serial_number : robot.serial_number
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
      case 'fired_laser':
        Game.map.addLaser(message.tower_sn, message.robot_sn);
      break;
    }

    console.log(JSON.stringify(message));
  },

  addRobot: function(type) {
    Game.send({ 'action' : 'create_robot', 'robot_type' : type });
  },

  upgradeRobot: function(type) {
    Game.send({ 'action' : 'upgrade_robots', 'robot_type' : type });
  },

  launchWave: function() {
    Game.send({ 'action' : 'launch_wave' });
  },

  send: function(data) {
    Game.socket.send(JSON.stringify(data));
  }
};
