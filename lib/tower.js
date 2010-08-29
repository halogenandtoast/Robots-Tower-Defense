var Tower = function(player, position, tower_type) {
  this.player = player;
  this.serial_number = this.player.game.unique_id();
  this.rate = 0.5;
  this.range = 96;
  this.damage = 1;
  this.level = 1;
  this.upgrade_cost = 50;
  this.position = position;
  this.tower_type = tower_type;
}

Tower.prototype = {
  upgrade: function() {
    if (this.player.cash >= this.upgrade_cost) {
      this.player.cash -= this.upgrade_cost;

      this.rate = this.rate + 1;
      this.damage = this.damage + 1;
      this.level = this.level + 1;
      this.range = this.range * 1.25;
      this.upgrade_cost = Math.round(this.upgrade_cost * 1.25, 0);
      this.player.tower_upgraded(this);
    }
  },

  fire: function(request) {
    var data = {tower_sn: request.tower_sn, robot_sn: request.robot_sn}
    if(this.tower_type == 'type1') {
      this.player.fired_laser(data);
    } else {
      this.player.fired_heat_seeker(data);
    }
  },

  to_json: function() {
    return {
      serial_number: this.serial_number,
      rate: this.rate,
      range: this.range,
      damage: this.damage,
      level: this.level,
      upgrade_cost: this.upgrade_cost,
      position: this.position,
      tower_type: this.tower_type
    }
  }
}
exports.Tower = Tower;
