var Robot = require(__dirname+"/robot").Robot,
    Tower = require(__dirname+"/tower").Tower;
var json = JSON.stringify;

var Player = function(client, game) {
  this.client = client;
  this.life = 10;
  this.upgrades = { 'speed': 1 };
  this.new_wave();
  this.towers = [];
  this.robots = [];
  this.game = game;
  this.money = 200;
};

Player.prototype = {
  new_wave: function(request) {
    this.wave = [];
  },

  lose_life: function(request) {
    this.life--;
    if(this.life == 0) {
      this.game.lost(this.client.sessionId);
    } else {
      this.relay('life_lost', { life: this.life });
    }
  },

  create_robot: function(request) {
    if(this.money >= 30) {
      var robot = new Robot(this, this.upgrades);
      this.wave.push(robot);
      this.relay('robot_created', { serial_number: robot.serial_number, robot_count: this.wave.length });
      this.money = this.money - 30;
    }
  },

  create_tower: function(request) {
    if(this.money >= 75) {
      var tower = new Tower(this, request['position']);
      this.towers.push(tower);
      this.relay('tower_created', tower.to_json());
      this.money = this.money - 75;
    }
  },

  upgrade_tower: function(request) {
    var position = this.find_tower_position(request.serial_number);
    if(position) {
      this.towers[position].upgrade();
    }
  },

  launch_wave: function(request) {
    wave = this.wave;
    this.robots = this.robots.concat(this.wave);
    this.new_wave();
    this.relay('wave_launched', { 'robots': wave.map(function(robot) { return robot.to_json(); }) });
  },

  damage_robot: function(request) {
    var position = this.find_tower_position(request.tower_serial_number);
    if(position) {
      request.tower = this.towers[position];
      this.game.ping(this, 'robot_damaged', request);
    }
  },

  cash_received: function(request) {
    this.cash = this.cash + request.amount;
    this.notify('cash_amount', { 'amount': this.cash });
  },

  robot_damaged: function(request) {
    var position = this.find_robot_position(request.serial_number);
    if (position) {
      this.robots[position].take_damage(request.tower.damage);
    }

  },

  destroy_robot: function(serial_number) {
    var position = this.find_robot_position(serial_number);
    var cash_value = this.robots[position].cash_value;
    Array.remove(this.robots, position);
    this.relay('robot_destroyed', { serial_number: serial_number });
    this.game.ping(this, 'cash_received', { amount: cash_calue });
  },

  find_robot_position: function(serial_number) {
    for (var i in this.robots) {
      if (this.robots[i].serial_number == serial_number) {
        return i;
      }
    }

    return false;
  },

  find_tower_position: function(serial_number) {
    for (var i in this.towers) {
      if (this.towers[i].serial_number == serial_number) {
        return i;
      }
    }

    return false;
  },

  relay: function(action, object) {
    object.id = this.client.sessionId;
    object.action = action;
    this.game.relay(json(object));
  },

  notify: function(action, oject) {
    object.id = this.client.sessionId;
    object.action = action
    this.client.send(json(object));
  }
}

exports.Player = Player;
