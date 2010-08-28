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
    var robot = new Robot(this, this.upgrades);
    this.wave.push(robot);
    this.relay('robot_created', { serial_number: robot.serial_number, robot_count: this.wave.length });
  },

  create_tower: function(request) {
    var tower = new Tower(this);
    this.towers.push(tower);
    this.relay('tower_created', { serial_number: tower.serial_number, position: request['position'] });
  },

  launch_wave: function(request) {
    wave = this.wave;
    this.robots.concat(this.wave);
    this.new_wave();
    this.relay('wave_launched', { 'robots': wave.map(function(robot) { return robot.to_json(); }) });
  },

  damage_robot: function(request) {
    var position = find_robot_position(request.serial_number);
    this.robots[position].take_damage(request.amount);
  },

  destroy_robot: function(serial_number) {
    var position = find_robot_position(serial_number);
    this.robots.remove(position);
    this.relay('robot_destroyed', { serial_number: serial_number });
  },

  find_robot_position: function(serial_number) {
    var position = -1;
    for(i in this.robots) {
      if(this.robots[i].serial_number == serial_number) {
        position = i;
        break;
      }
    }
    return position;
  },

  relay: function(action, object) {
    object.id = this.client.sessionId;
    object.action = action;
    this.game.relay(json(object));
  }
}

exports.Player = Player;
