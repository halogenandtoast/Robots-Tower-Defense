var Player = require(__dirname+"/player").Player;

var Game = function() {
  this.players = {};
};

Game.prototype = {
  add_player: function(client) {
    this.players[client.sessionId] = new Player(client);
  },
  player: function(client) {
    return this.players[client.sessionId];
  }
}

exports.Game = Game;
