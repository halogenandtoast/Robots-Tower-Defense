var Map = function(topPlayerId, bottomPlayerId) {
  this.setupCanvas();
  this.setupPositions();

  this.topPlayer    = topPlayerId;
  this.bottomPlayer = bottomPlayerId;
};

Map.prototype = {
  buildAt   : undefined,
  upgradeAt : undefined,
  robots    : [],
  towers    : [],
  lasers    : [],
  seekers   : [],
  positions : [],

  setupCanvas: function() {
    this.canvas  = document.getElementsByTagName('canvas')[0];
    this.context = this.canvas.getContext('2d');
    this.canvas.addEventListener('click', function(event) {
      var x = event.offsetX;
      var y = event.offsetY;
      var position = 1 + Math.floor(x / 40) + (20 * Math.floor((y - 117) / 160));

      $('#add-tower')[0].style.display = 'none';
      $('#upgrade-tower')[0].style.display = 'none';
      this.upgradeAt = undefined;

      if((this.topPlayer == Game.session_id && position > 20) || (this.bottomPlayer == Game.session_id && position <= 40)) {
        if (y >= 117 && y <= 477) {
          var x = 4 + (((position - 1) % 20) * 40);
          var y = 125 + (160 * Math.round((position - ((position - 1) % 20)) / 20));

          if (this.positions[position]) {
            this.buildAt = position;

            var
            element = $('#add-tower')[0];
            element.style.top  = (y - 44) + 'px';
            element.style.left = (x - 4) + 'px';
            element.style.display = 'block';
          } else {
            var tower;

            for (var i = 0, l = this.towers.length; i < l; i++) {
              tower = this.towers[i];

              if (tower) {
                if (tower.x == x && tower.y == y) {
                  break;
                }
              }
            }

            if (tower.session_id == Game.session_id) {
              this.upgradeAt = tower;
              this.updateTowerUpgrade(x, y, true);
            }
          }
        }
      }
    }.bind(this));

    $('#upgrade-tower a')[0].addEventListener('click', function(event) {
      $('#upgrade-tower')[0].style.display = 'none';

      Game.send({
        'action'        : 'upgrade_tower',
        'serial_number' : this.upgradeAt.serial_number
      });

      event.preventDefault();
    }.bind(this));

    $('#upgrade-tower a')[0].addEventListener('click', function(event) {
      $('#upgrade-tower')[0].style.display = 'none';

      Game.send({
        'action'        : 'upgrade_tower',
        'serial_number' : this.upgradeAt.serial_number
      });

      event.preventDefault();
    }.bind(this));

    $('#add-tower a')[0].addEventListener('click', function(event) {
      Game.send({
        'action'     : 'create_tower',
        'position'   : this.buildAt,
        'tower_type' : 'type1'
      });

      this.buildAt = undefined;

      $('#add-tower')[0].style.display = 'none';

      event.preventDefault();
    }.bind(this));
    $('#add-tower a + a')[0].addEventListener('click', function(event) {
      Game.send({
        'action'     : 'create_tower',
        'position'   : this.buildAt,
        'tower_type' : 'type2'
      });

      this.buildAt = undefined;

      $('#add-tower')[0].style.display = 'none';

      event.preventDefault();
    }.bind(this));
  },

  setupPositions: function() {
    this.positions = [];
    for(var i = 0; i < 60; i++) {
      this.positions.push(true);
    }
  },

  updateTowerUpgrade: function(x, y, show) {
    var tower = this.upgradeAt;

    if (!tower) {
      return;
    }

    var element = $('#upgrade-tower')[0];

    if (x && y) {
      element.style.top  = (y - 119) + 'px';
      element.style.left = (x - 4) + 'px';
    }

    $('h2 span', element)[0].innerHTML = tower.level + 1;
    $('.range span', element)[0].innerHTML = '+1'; // + (tower.rate + 1);
    $('.damage span', element)[0].innerHTML = '+1'; // + (tower.damage + 1);
    $('.rate span', element)[0].innerHTML = '+1.25'; // + (tower.range * 1.25);
    $('.cost', element)[0].innerHTML = '$' + tower.upgrade_cost;

    var cash;

    if (Game.session_id == Game.map.topPlayer) {
      cash = parseInt($('#player-1 .cash')[0].innerText.replace('$', ''), 10);
    } else {
      cash = parseInt($('#player-2 .cash')[0].innerText.replace('$', ''), 10);
    }

    if (cash < tower.upgrade_cost) {
      $('a', element)[0].className = 'disabled';
    } else {
      $('a', element)[0].className = '';
    }

    if (show) {
      element.style.display = 'block';
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
    for (var i = 0, l = this.seekers.length; i < l; i++) {
      if (this.seekers[i]) {
        var robot = this.robotBySerialNumber(this.seekers[i].tracking);
        if(robot) {
          var dX = (robot.x + 16) - this.seekers[i].x;
          var dY = (robot.y + 16) - this.seekers[i].y;
          var length = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
          if(length > 2) {
            dX = dX/length;
            dY = dY/length;
            this.seekers[i].angle = Math.acos(dY);
            this.seekers[i].x = this.seekers[i].x + (2 * dX);
            this.seekers[i].y = this.seekers[i].y + (2 * dY);
          } else {
            if(Game.session_id != this.session_id) {
              Game.send({
                  'action'              : 'damage_robot',
                  'tower_serial_number' : this.seekers[i].tower_sn,
                  'serial_number'       : robot.serial_number
                });
            }
            this.seekers.splice(i, 1);
            i--;
          }
        }
      }
    }
  },

  render: function() {
    this.context.drawImage(Map.images[0], 0, 0);

    for(var i = 1; i <= 60; i++) {
      if(this.topPlayer == Game.session_id && i <= 20) {
        var x = 4 + (((i - 1) % 20) * 40);
        var y = 125 + (160 * Math.round((i - ((i - 1) % 20)) / 20));
        this.context.drawImage(Map.images[20], x, y);
      } else if (this.bottomPlayer == Game.session_id && i > 40) {
        var x = 4 + (((i - 1) % 20) * 40);
        var y = 125 + (160 * Math.round((i - ((i - 1) % 20)) / 20));
        this.context.drawImage(Map.images[20], x, y);
      }
    }

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

    for(var i = 0, l = this.seekers.length; i < l; i++) {
      var seeker = this.seekers[i];
      this.context.save();
      this.context.translate(seeker.x + 3, seeker.y + 4);
      alert(seeker.angle);
      this.context.rotate(-seeker.angle + Math.PI);
      this.context.drawImage(Map.images[50], -3, -4);
      this.context.restore();
    }

    if (this.buildAt) {
      var x = 4 + (((this.buildAt - 1) % 20) * 40);
      var y = 125 + (160 * Math.round((this.buildAt - ((this.buildAt - 1) % 20)) / 20));

      this.context.drawImage(Map.images[10], x, y);
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

  addSeeker: function(tower_sn, robot_sn) {
    var tower = this.towerBySerialNumber(tower_sn)
    if(tower) {
      var seeker = { angle: 0, x: tower.x + 16, y: tower.y + 16, tower_sn: tower_sn, tracking: robot_sn };
      this.seekers.push(seeker);
    }
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

Map.images = [];
Map.images[0] = new Image();
Map.images[0].src = '/images/map.png';
Map.images[1] = new Image();
Map.images[1].src = '/images/robot-1.png';
Map.images[2] = new Image();
Map.images[2].src = '/images/robot-2.png';
Map.images[10] = new Image();
Map.images[10].src = '/images/active-tower-slot.png';
Map.images[20] = new Image();
Map.images[20].src = '/images/x-tower.png';
Map.images[50] = new Image();
Map.images[50].src = '/images/projectile.png';
