var Tower = function(x, y) {
  this.x = x;
  this.y = y;
};

Tower.prototype = {
  render: function(context) {
    var x = this.x * 32;
    var y = this.y * 32;

    context.fillStyle = '#C00';
    context.fillRect(x, y, 32, 32);
  }
};
