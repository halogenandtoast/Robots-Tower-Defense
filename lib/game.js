var Player = require(__dirname+"/player").Player;

var Game = function(id, world) {
  this.id = id;
  this.players = [];
  this.ready = false;
  this.finished = false;
  this.player_count = 0;
  this.world = world;
};

Game.prototype = {
  add_player: function(client) {
    this.players.push(new Player(client, this));
    this.player_count++;
    if(this.player_count == 2) {
      this.world.remove_from_pending(this.id);
      this.ready = true;
      this.relay(json({'action': 'game_ready'}));
    }
  },
  player: function(client) {
    return this.players[0].client.sessionId == client.sessionId ? this.players[0] : this.players[1];
  },
  lost: function(sessionId) {
    this.finished = true;
    this.relay(json({'action': 'game_finished', 'id': sessionId}));
  },
  disconnect: function(sessionId) {
    if(!this.ready) {
      this.world.remove_from_pending(this.id);
    }
    if(!this.finished) {
      this.finished = true;
      this.relay(json({'action': 'game_disbanded', 'id': sessionId}));
    }
  },
  relay: function(message) {
    this.players[0].client.send(message);
    if(this.player_count == 2) {
      this.players[1].client.send(message);
    }
  }
}

exports.Game = Game;
