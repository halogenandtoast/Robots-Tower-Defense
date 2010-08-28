var Wave = function(upgrades) {
  this.speed = upgrades['speed'];
  this.robots = [];
}

Wave.prototype = {
  hash: function() {
    return { 'robots': this.robots, 'speed': this.speed }
  }
}

exports.Wave = Wave;
