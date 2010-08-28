var Robot = function(options) {
  this.x          = options.x;
  this.y          = options.y;
  this.dX         = options.dX;
  this.dY         = 0;
  this.image      = options.image;
  this.speed      = options.speed;
  this.offsetX    = 0;
  this.offsetY    = 0;
  this.session_id = options.session_id;
};

Robot.prototype = {
  render: function(context) {
    var x = (this.x * 32) + this.offsetX;
    var y = (this.y * 32) + this.offsetY;

    context.save();

    if (this.image == 2) {
      context.translate(x, y);
      context.rotate(Math.PI);
    } else {
      context.translate(x, y - 32);
    }

    context.drawImage(this.map.images[this.image], 0, 0);
    context.restore();
  },

  update: function() {
    this.offsetX += (this.speed * this.dX);
    this.offsetY += (this.speed * this.dY);

    if (Math.abs(this.offsetX) >= 32) {
      this.x       += this.dX;
      this.offsetX  = 0;
    }

    if (Math.abs(this.offsetY) >= 32) {
      this.y       += this.dY;
      this.offsetY  = 0;
    }

    if (this.x < -1 || this.x > 26) {
      if (this.x < -1 && Game.session_id != this.session_id) {
        Game.send({ 'action' : 'lose_life' });
      }

      this.map.removeRobot(this);
    }
  }
};
