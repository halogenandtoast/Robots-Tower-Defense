var Game = require(__dirname+'/game').Game,
    sys = require('sys');

var World = {
  games: new Array(),
  pending_games: new Array(),
  get_game: function() {
    if(World.pending_games.length == 0) {
      var id    = World.pending_games.length;
      var index = World.games.length;

      World.games.push(new Game(id, this));
      World.pending_games.push(index);

      return World.games[index];
    } else {
      index = World.pending_games.pop();
      return World.games[index];
    }
  },
  remove_from_pending: function(id) {
    var index = World.pending_games[id];

    World.pending_games.splice(id, 1);
  }

}

exports.World = World;
