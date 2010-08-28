var Wave = function(upgrades) {
  this.speed = upgrades['speed'];
  this.units = [];
}

Wave.prototype = {
  hash: function() {
    return { 'units': this.units, 'speed': this.speed }
  }
}

exports.Wave = Wave;
