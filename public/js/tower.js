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
  this.opacity   = 0.75;
  this.drawRange = true;
};

Tower.prototype = {
  render: function(context) {
    if (this.drawRange) {
      context.beginPath();
      context.arc(this.x + 16, this.y + 16, this.range, 0, Math.PI*2, true);
      context.closePath();
      context.fillStyle = "rgba(0,0,0," + this.opacity + ")"
      context.fill();

      this.opacity -= 0.01;

      if (this.opacity <= 0) {
        this.opacity   = 0.75;
        this.drawRange = false;
      }
    }

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

    context.save();
    context.translate(29, 4);

    for (var i = 0, l = (this.level - 1); i < l; i++) {
      context.drawImage(Tower.upgradeImage, 0, i * 4);
    }

    context.restore();
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


Tower.upgradeImage = new Image();
Tower.upgradeImage.src = '/images/tower-upgrade-identifier.png';
