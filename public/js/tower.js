var Tower = function(options) {
  this.x      = options.x;
  this.y      = options.y;
  this.rate   = options.rate   || 0.75;
  this.range  = options.range  || 96;
  this.damage = options.damage || 1;
  this.session_id = options.session_id;
  this.serial_number = options.serial_number;
};

Tower.prototype = {
  render: function(context) {
    context.beginPath();
    context.arc(this.x + 16, this.y + 16, this.range, 0, Math.PI*2, true);
    context.closePath();
    context.fillStyle = "rgba(0,0,0,0.3)"
    context.fill();
    context.save();
    context.translate(this.x, this.y);
    context.drawImage(Tower.image, 0, 0);
    context.restore();
  },

  update: function(context) {
    if (!this.last_update) {
      this.last_update = (new Date()).getTime();
    }

    var now   = (new Date()).getTime();
    var delay = 1000 / this.rate;

    if (now - this.last_update > delay) {
      this.last_update = now;

      var robot = Game.map.findRobotIn(this.x, this.y, this.range, this.session_id);

      if (robot) {
        context.addLaser(this.serial_number, robot.serial_number);
      }
    }
  }
};

Tower.image = new Image();
Tower.image.src = '/images/tower-1.png';
