var Wave = require(__dirname+'/wave').Wave,
    json = JSON.stringify;

var Player = function(client) {
  this.client = client;
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
    this.relay('life_lost', { life: this.life });
  },

  create_unit: function() {
    this.wave.units.push('1');
    this.relay('unit_created', { unit_count: this.wave.units.length });
  },

  launch_wave: function() {
    wave = this.wave.hash();
    this.new_wave();
    this.relay('wave_launched', wave);
  },

  relay: function(action, object) {
    object.id = this.client.sessionId;
    object.action = action;
    this.client.send(json(object));
    this.client.broadcast(json(object));
  }
}

exports.Player = Player;
