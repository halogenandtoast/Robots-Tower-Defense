var Robot = function(player, type) {
  this.player = player;
  this.type = type || 'type1';
  this.serial_number = this.player.game.unique_id();
  this.life = this.player.upgrades[this.type].life || 1;
  this.speed = this.player.upgrades[this.type].speed || 1;
  this.cash_value = 25 * (26 - 25/(this.player.upgrades[this.type].level || 1));
}

Robot.prototype = {
  take_damage: function(amount) {
    this.life = this.life - amount;
    if(this.dead()) {
      this.player.destroy_robot(this.serial_number);
    }
  },

  dead: function() {
    return this.life <= 0;
  },

  to_json: function() {
    return {
      serial_number: this.serial_number,
      life: this.life,
      speed: this.speed,
      type: this.type
    };
  }
}

exports.Robot = Robot;
