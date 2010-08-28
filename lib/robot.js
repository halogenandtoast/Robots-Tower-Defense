var Robot = function(player, upgrades) {
  this.player = player;
  this.serial_number = this.player.game.unique_id();
  this.life = 1;
  this.speed = 1;
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
      speed: this.speed
    };
  }
}

exports.Robot = Robot;
