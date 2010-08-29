var Tower = function(options) {
  this.x      = options.x;
  this.y      = options.y;
  this.rate   = options.rate   || 0.75;
  this.range  = options.range  || 96;
  this.angle  = 90;
  this.level  = options.level || 1;
  this.image  = options.image;
  this.damage = options.damage || 1;
  this.session_id = options.session_id;
  this.upgrade_cost  = options.upgrade_cost;
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
    context.drawImage(this.image == 1 ? Tower.imageBottom : Tower.other, 0, 0);

    if (this.image == 1) {
      context.save();
      context.translate(0.6274169979695223, 0.6274169979695223);
      context.translate(16, 16);
      context.rotate(this.angle * Math.PI / 180);
      context.translate(-16,-16);
      context.drawImage(Tower.imageTop, 0, 0);
      context.restore();
    }

    if (this.session_id == Game.map.topPlayer) {
      context.drawImage(Tower.redBadge, 0, 0);
    } else {
      context.drawImage(Tower.blueBadge, 0, 0);
    }

    context.restore();
  },

  update: function(context) {
    if (!this.last_update) {
      this.last_update = (new Date()).getTime();
    }

    var now   = (new Date()).getTime();
    var delay = 1000 / this.rate;

    this.target = Game.map.findRobotIn(this.x, this.y, this.range, this.session_id);

    if (this.target) {
      this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x) / Math.PI * 180;

      if (now - this.last_update > delay) {
        this.last_update = now;
        Game.send({action: 'fire', tower_sn: this.serial_number, robot_sn: this.target.serial_number})
        // Game.map.addLaser(this.serial_number, this.target.serial_number);
      }
    }
  }
};

Tower.imageBottom = new Image();
Tower.imageBottom.src = '/images/tower-1.png';
Tower.imageTop = new Image();
Tower.imageTop.src = '/images/tower-1-top.png';
Tower.other = new Image();
Tower.other.src = '/images/tower-2.png';

Tower.redBadge = new Image();
Tower.redBadge.src = '/images/red-tag.png';
Tower.blueBadge = new Image();
Tower.blueBadge.src = '/images/blue-tag.png';
