var Tower = function(player) {
  this.player = player;
  this.serial_number = this.player.game.unique_id();
  this.rate = 1;
  this.range = 32;
  this.damage = 1;
}

exports.Tower = Tower;
