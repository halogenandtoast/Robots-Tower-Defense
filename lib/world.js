var Game = require(__dirname+'/game').Game,
    sys = require('sys');

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

var World = {
  games: new Array(),
  pending_games: new Array(),
  get_game: function() {
    if(World.pending_games.length == 0) {
      index = World.games.length;
      id = World.pending_games.length;
      World.games.push(new Game(id, this));
      World.pending_games.push(index);
      return World.games[index];
    } else {
      index = World.pending_games.pop();
      return World.games[index];
    }
  },
  remove_from_pending: function(id) {
    World.pending_games.remove(id);
  }

}

exports.World = World;
