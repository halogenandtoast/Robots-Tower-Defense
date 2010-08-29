var Robot = require(__dirname+"/robot").Robot,
    Tower = require(__dirname+"/tower").Tower;
var json = JSON.stringify;

var Player = function(client, game) {
  this.client = client;
  this.life = 10;
  //TODO base this on robot types
  this.upgrades = {
    'type1' : { 'speed': 0.5, 'life': 2, 'level': 1 },
    'type2' : { 'speed': 3, 'life': 1, 'level': 1 }
  };
  this.game = game;
  this.towers = [];
  this.robots = [];
  this.cash = this.game.starting_info.cash;
  this.new_wave(5);
  this.upgrade_costs = {
    'type1': this.game.starting_info.robots.type1.upgrade_cost,
    'type2': this.game.starting_info.robots.type2.upgrade_cost
  }
};

Player.prototype = {
  new_wave: function(count) {
    var self = this;
    this.wave = [];
    for(var i = 0; i < count; i++) {
      this.wave.push(new Robot(self, 'type2'));
    }
  },

  fire: function(request) {
    var position = this.find_tower_position(request.tower_sn);
    if(position) {
      var tower = this.towers[position];

      if(tower) {
        tower.fire(request);
      }
    }
  },

  upgrade_robots: function(request) {
    var upgrade_cost = this.upgrade_costs[request.robot_type];
    if(this.cash >= upgrade_cost) {
      this.cash -= upgrade_cost;

      if(this.upgrades[request.robot_type].speed < 2) {
        this.upgrades[request.robot_type].speed = this.upgrades[request.robot_type].speed * 2;
      } else {
        this.upgrades[request.robot_type].speed = Math.pow(this.upgrades[request.robot_type].speed, 2);
      }
      this.upgrades[request.robot_type].life = Math.pow(this.upgrades[request.robot_type].life, 2);
      this.upgrades[request.robot_type].level++;
      this.upgrade_costs[request.robot_type] = Math.round(this.upgrade_costs[request.robot_type] * 2.25, 0);

      this.relay('cash_amount', { 'amount': this.cash });
      this.notify('robots_upgraded', {
        level: this.upgrades[request.robot_type].level,
        upgrade_cost: this.upgrade_costs[request.robot_type],
        robot_type: request.robot_type
      });
    }
  },

  lose_life: function(request) {
    this.life--;
    if(this.life == 0) {
      this.game.lost(this.client.sessionId);
    } else {
      this.relay('life_lost', { life: this.life });
      this.game.ping(this, 'cash_received', { amount: 25 });
    }
  },

  create_robot: function(request) {
    var robot_type = request.robot_type || 'type1';
    var cost = this.game.starting_info.robots[robot_type].cost;
    if(this.cash >= cost) {
      var robot = new Robot(this, robot_type);
      var count = 0;
      this.wave.push(robot);
      this.wave.forEach(function(item) {
        if (item.type == robot.type) {
          count++;
        }
      });
      this.notify('robot_created', {
        serial_number: robot.serial_number,
        robot_count: count,
        robot_type: robot_type
      });
      this.cash = this.cash - cost;
      this.relay('cash_amount', { 'amount': this.cash });
    }
  },

  create_tower: function(request) {
    var tower_type = request.tower_type || 'type1';
    var cost = this.game.starting_info.towers[tower_type].cost;
    if(this.cash >= cost) {
      var tower = new Tower(this, request['position'], tower_type);
      this.towers.push(tower);
      this.relay('tower_created', tower.to_json());
      this.cash = this.cash - cost;
      this.relay('cash_amount', { 'amount': this.cash });
    }
  },

  upgrade_tower: function(request) {
    var position = this.find_tower_position(request.serial_number);
    if(position) {
      this.towers[position].upgrade();
    }
  },

  tower_upgraded: function(tower) {
    this.relay('cash_amount', { 'amount': this.cash });
    this.relay('tower_upgraded', tower.to_json());
  },

  launch_wave: function(request) {
    wave = this.wave;
    this.robots = this.robots.concat(this.wave);
    this.new_wave(0);
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
    this.relay('cash_amount', { 'amount': this.cash });
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
    this.game.ping(this, 'cash_received', { amount: cash_value });
  },

  fired_laser: function(data) {
    this.relay('fired_laser', data);
  },

  fired_seeker: function(data) {
    this.relay('fired_seeker', data);
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

  notify: function(action, object) {
    object.id = this.client.sessionId;
    object.action = action
    this.client.send(json(object));
  }
}

exports.Player = Player;
