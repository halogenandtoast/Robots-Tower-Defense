var Map = function(topPlayerId, bottomPlayerId) {
  this.loadImages();
  this.setupCanvas();
  this.setupPositions();

  this.topPlayer    = topPlayerId;
  this.bottomPlayer = bottomPlayerId;
};

Map.prototype = {
  active    : undefined,
  robots    : [],
  towers    : [],
  lasers    : [],
  positions : [],

  setupCanvas: function() {
    this.canvas  = document.getElementsByTagName('canvas')[0];
    this.context = this.canvas.getContext('2d');
    this.canvas.addEventListener('click', function(event) {
      var x = event.offsetX;
      var y = event.offsetY;
      var position = 1 + Math.floor(x / 40) + (20 * Math.floor((y - 117) / 160));

      if (y >= 117 && y <= 477 && this.positions[position]) {
        var x = 4 + (((position - 1) % 20) * 40);
        var y = 125 + (160 * Math.round((position - ((position - 1) % 20)) / 20));

        this.active = position;

        var
        element = $('#add-tower')[0];
        element.style.display = 'block';
        element.style.top  = (y - 44) + 'px';
        element.style.left = (x - 4) + 'px';
      }
    }.bind(this));

    $('#add-tower a')[0].addEventListener('click', function(event) {
      Game.send({
        'action'   : 'create_tower',
        'position' : this.active
      });

      this.active = undefined;

      $('#add-tower')[0].style.display = 'none';

      event.preventDefault();
    }.bind(this));
    $('#add-tower a')[0].addEventListener('click', function(event) {
      Game.send({
        'action'   : 'create_tower',
        'position' : this.active
      });

      this.active = undefined;

      $('#add-tower')[0].style.display = 'none';

      event.preventDefault();
    }.bind(this));
  },

  loadImages: function() {
    this.images = [];
    this.images[0] = new Image();
    this.images[0].src = '/images/map.png';
    this.images[1] = new Image();
    this.images[1].src = '/images/robot-1.png';
    this.images[2] = new Image();
    this.images[2].src = '/images/robot-2.png';

    this.images[100] = new Image();
    this.images[100].src = '/images/active-tower-slot.png';
  },

  setupPositions: function() {
    this.positions = [];
    for(var i = 0; i < 60; i++) {
      this.positions.push(true);
    }
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

    for (var i = 0, l = this.robots.length; i < l; i++) {
      if (this.robots[i]) {
        this.robots[i].render(this.context);
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
          if(Game.session_id != this.session_id) {
            Game.send({
              'action'              : 'damage_robot',
              'tower_serial_number' : tower.serial_number,
              'serial_number'       : robot.serial_number
            });
        }
        }
        laser['ttl']--;
      }
    }

    if (this.active) {
      var x = 4 + (((this.active - 1) % 20) * 40);
      var y = 125 + (160 * Math.round((this.active - ((this.active - 1) % 20)) / 20));

      this.context.drawImage(this.images[100], x, y);
    }
  },

  findRobotIn: function(x, y, radius, session_id) {
    for (var i = 0, l = this.robots.length; i < l; i++) {
      var robot = this.robots[i];

      if (robot.session_id == session_id) {
        continue;
      }

      if (Math.pow((x - robot.x), 2) + Math.pow((y - robot.y), 2) <= Math.pow(radius, 2)) {
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
    var laser = { 'from': tower_sn, 'to': robot_sn, 'ttl': 1 };
    this.lasers.push(laser);
  },

  addTower: function(tower, position) {
    this.towers.push(tower);
    this.positions[position] = false;
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
