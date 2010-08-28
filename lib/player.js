var Wave = require(__dirname+'/wave').Wave,
    json = JSON.stringify;

var Player = function(client, game) {
  this.client = client;
  this.life = 10;
  this.upgrades = { 'speed': 1 };
  this.new_wave();
  this.towers = [];
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

  create_unit: function(request) {
    this.wave.units.push('1');
    this.relay('unit_created', { unit_count: this.wave.units.length });
  },

  create_tower: function(request) {
    this.towers.push('1');
    this.relay('tower_created', { position: request['position'] });
  },

  launch_wave: function(request) {
    wave = this.wave.hash();
    this.new_wave();
    this.relay('wave_launched', wave);
  },

  relay: function(action, object) {
    object.id = this.client.sessionId;
    object.action = action;
    this.game.relay(json(object));
  }
}

exports.Player = Player;
