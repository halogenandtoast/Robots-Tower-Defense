var Robot = function(options) {
  this.x          = options.x;
  this.y          = options.y;
  this.dX         = options.dX || 0;
  this.dY         = options.dY || 0;
  this.image      = options.image;
  this.speed      = options.speed;
  this.session_id = options.session_id;
  this.serial_number = options.serial_number;
};

Robot.prototype = {
  render: function(context) {
    context.save();

    if (this.image == 2) {
      context.translate(this.x + 16, this.y + 16);
      context.rotate(Math.PI);
    } else {
      context.translate(this.x + 16, this.y + 16);
    }

    context.drawImage(this.map.images[this.image], -16, -16);
    context.restore();

  },

  update: function() {
    this.x = this.x + (this.speed * this.dX);
    this.y = this.y + (this.speed * this.dY);

    if (this.x < -1 || this.x > 801) {
      if (Game.session_id != this.session_id) {
        Game.send({ 'action' : 'lose_life' });
      }

      this.map.removeRobotBySerialNumber(this.serial_number);
    }
  }
};
