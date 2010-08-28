var Robots = function(player, serial_number, upgrades) {
  this.player = player;
  this.serial_number = serial_number;
  this.life = 1;
}

Robot.prototype = {
  take_damage = function(amount) {
    this.life = this.life - amount;
    if(this.dead()) {
      this.player.destroy_robot(this.serial_number);
    }
  },

  dead = function() {
    return this.life <= 0;
  }
}
