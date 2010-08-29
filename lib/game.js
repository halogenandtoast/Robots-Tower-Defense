var Player = require(__dirname+"/player").Player;

var Game = function(id, world) {
  this.id = id;
  this.players = [];
  this.ready = false;
  this.finished = false;
  this.player_count = 0;
  this._unique_id = 1;
  this.world = world;
  this.starting_info = {
    robots : {type1 : { cost : 30, upgrade_cost: 300 }, type2: { cost : 50, upgrade_cost: 300 }},
    towers : {type1 : { cost : 75 }, type2: { cost: 100}},
    cash: 200
  }
};

Game.prototype = {
  unique_id: function() {
    var temp = this._unique_id;
    this._unique_id++;
    return temp;
  },

  add_player: function(client) {
    this.players.push(new Player(client, this));
    this.player_count++;
    if(this.player_count == 2) {
      this.world.remove_from_pending(this.id);
      this.ready = true;
      var response = JSON.parse(json(this.starting_info));
      response.action = 'game_ready';
      response.top_player_id = this.players[0].client.sessionId;
      response.bottom_player_id = this.players[1].client.sessionId;
      this.relay(json(response));
    }
  },
  player: function(client) {
    return this.players[0].client.sessionId == client.sessionId ? this.players[0] : this.players[1];
  },
  ping: function(player, action, request) {
    request.action = action;
    opponent = this.opponent(player.client);
    opponent[action](request);
  },
  opponent: function(client) {
    return this.players[0].client.sessionId == client.sessionId ? this.players[1] : this.players[0];
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
