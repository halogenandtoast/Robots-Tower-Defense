var Wave = require(__dirname+'/wave').Wave

var Player = function() {
  this.life = 10;
  this.upgrades = { 'speed': 1 };
  this.new_wave();
};

Player.prototype = {
  new_wave: function() {
    this.wave = new Wave(this.upgrades);
  },
  lose_life: function() {
    this.life--;
  }
}

exports.Player = Player
