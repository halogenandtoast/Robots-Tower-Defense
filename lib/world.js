var Game = require(__dirname+'/game').Game,
    sys = require('sys');

Array.remove = function(array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, rest);
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
    Array.remove(World.pending_games, id);
  }

}

exports.World = World;
