var Tower = function(options) {
  this.x = options.x;
  this.y = options.y;
  this.session_id = options.session_id;
};

Tower.prototype = {
  render: function(context) {
    var x = this.x;
    var y = this.y;

    context.save();
    context.translate(x, y);
    context.drawImage(Tower.image, 0, 0);
    context.restore();
  }
};

Tower.image = new Image();
Tower.image.src = '/images/tower-1.png';
