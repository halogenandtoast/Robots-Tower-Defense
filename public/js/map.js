var Map = function(topPlayerId, bottomPlayerId) {
  this.loadImages();
  this.createCanvas();
  this.topPlayer = topPlayerId;
  this.bottomPlayer = bottomPlayerId;
};

Map.prototype = {
  robots : [],
  towers : [],
  lasers: [],

  createCanvas: function() {
    this.body    = document.getElementsByTagName('body')[0];
    this.canvas  = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.width  = 800;
    this.canvas.height = 600;
    this.canvas.addEventListener('click', function(event) {
      var x = event.offsetX;
      var y = event.offsetY;

      if (y >= 117 && y <= 477) {
        Game.send({
          'action'   : 'create_tower',
          'position' : 1 + Math.floor(x / 40) + (20 * Math.floor((y - 117) / 160))
        });
      }
    });
    this.body.appendChild(this.canvas);
  },

  loadImages: function() {
    this.images = [];
    this.images[0] = new Image();
    this.images[0].src = '/images/map.png';
    this.images[1] = new Image();
    this.images[1].src = '/images/robot-1.png';
    this.images[2] = new Image();
    this.images[2].src = '/images/robot-2.png';
  },

  cycle: function() {
    this.update();
    this.render();
  },

  update: function() {
    for(var i = 0, l = this.towers.length; i < l; i++) {
      if(this.towers[i]) {
        this.towers[i].update(this);
      }
    }
    for (var i = 0, l = this.robots.length; i < l; i++) {
      if (this.robots[i]) {
        this.robots[i].update();
      }
    }
  },

  render: function() {
    this.context.drawImage(this.images[0], 0, 0);

    for (var i = 0, l = this.towers.length; i < l; i++) {
      if (this.towers[i]) {
        this.towers[i].render(this.context);
      }
    }

    for (var i = 0, l = this.lasers.length; i < l; i++) {
      var laser = this.lasers[i];
      if(laser && laser['ttl'] > 0) {
        var tower = this.towerBySerialNumber(laser['from']);
        var robot = this.robotBySerialNumber(laser['to']);
        if(tower && robot) {
          this.context.save();
          this.context.beginPath();
          this.context.moveTo(tower.x + 16, tower.y + 16);
          this.context.lineTo(robot.x + 16, robot.y + 16);
          this.context.strokeStyle = "#FF00FF";
          this.context.stroke();
          this.context.restore();
          laser['ttl']--;
        }
      }
    }

    for (var i = 0, l = this.robots.length; i < l; i++) {
      if (this.robots[i]) {
        this.robots[i].render(this.context);
      }
    }

  },

  findRobotIn: function(x, y, radius, session_id) {
    for (var i = 0, l = this.robots.length; i < l; i++) {
      var robot = this.robots[i];

      if (robot.session_id == session_id) {
        continue;
      }

      if (Math.pow((x - robot.x + 32), 2) + Math.pow((y - robot.y + 32), 2) < Math.pow(radius, 2)) {
        return robot;
      }
    }

    return false;
  },


  onResize: function() {
    this.canvas.width  = this.body.clientWidth;
    this.canvas.height = this.body.clientHeight;
  },


  addRobot: function(robot) {
    robot.map = this;

    this.robots.push(robot);
  },

  addLaser: function(tower_sn, robot_sn) {
    var laser = { 'from': tower_sn, 'to': robot_sn, 'ttl': 100 };
    this.lasers.push(laser);
  },

  removeRobotBySerialNumber: function(serial_number) {
    for (var i = 0, l = this.robots.length; i < l; i++) {
      if (this.robots[i].serial_number == serial_number) {
        this.robots.splice(i, 1);
        break;
      }
    }
  },

  robotBySerialNumber: function(serial_number) {
    for (var i = 0, l = this.robots.length; i < l; i++) {
      if (this.robots[i].serial_number == serial_number) {
        return this.robots[i];
      }
    }
  },

  towerBySerialNumber: function(serial_number) {
    for (var i = 0, l = this.towers.length; i < l; i++) {
      if (this.towers[i].serial_number == serial_number) {
        return this.towers[i];
      }
    }
  }
};
