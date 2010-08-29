var started = false;
var callback = function() {
  Game.addEmptyDialogue("<h2>Waiting on an opponent...</h2>");
  Game.connect();
}
Game.displayHelp('Save', callback);
