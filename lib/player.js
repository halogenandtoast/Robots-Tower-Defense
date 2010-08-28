var Wave = require(__dirname+'/wave').Wave,
    json = JSON.stringify;

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
    this.wave = new Wave(this.upgrades);
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
    var unique_id = this.game.unique_id();
    this.wave.robots.push(unique_id);
    this.relay('robot_created', { serial_number: unique_id, robot_count: this.wave.robots.length });
  },

  create_tower: function(request) {
    var unique_id = this.game.unique_id();
    this.towers.push(unique_id);
    this.relay('tower_created', { serial_number: unique_id, position: request['position'] });
  },

  launch_wave: function(request) {
    wave = this.wave.hash();
    this.robots.concat(this.wave.robots);
    this.new_wave();
    this.relay('wave_launched', wave);
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
