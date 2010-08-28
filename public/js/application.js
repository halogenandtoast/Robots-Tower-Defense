Function.prototype.bind = function(scope) {
  var _function = this;

  return function() {
    return _function.apply(scope, arguments);
  };
};




function $(id) {
  return document.getElementById(id);
};

var Game = {
  bindEventListeners: function() {
    $('add-unit').addEventListener('click', function(event) {
      Game.addUnit();

      event.preventDefault();
    });

    $('launch-wave').addEventListener('click', function(event) {
      Game.launchWave();

      event.preventDefault();
    });
  },

  connect: function() {
    var
    socket = new io.Socket(window.location.hostname, { port : 8024 });
    socket.on('message', Game.onMessage);

    if (socket.connect()) {
      Game.map    = new Map();
      Game.socket = socket;
      Game.bindEventListeners();

      setInterval(function() {
        Game.map.render();
      }.bind(this), 1000 / 30);
    }
  },

  onMessage: function(message) {
    if (!Game.session_id) {
      Game.session_id = Game.socket.transport.sessionid;
    }

    message = JSON.parse(message);

    switch (message.action) {
      case 'life_lost':
        if (Game.session_id == message.id) {
          var
          element = $('health');
          element.innerHTML = parseInt(element.innerHTML, 10) - 1;
        }
      break;

      case 'unit_created':
        if (Game.session_id == message.id) {
          $('unit-count').innerHTML = message.unit_count;
        }
      break;

      case 'wave_launched':
        for (var i = 0, l = message.units.length; i < l; i++) {
          setTimeout(function() {
            var x     = -1;
            var y     = 7;
            var dX    = 1;
            var image = 1;

            if (message.id != Game.session_id) {
              x     = 26;
              y     = 8;
              dX    = -1;
              image = 2;
            }

            var unit = new Unit({
              x          : x,
              y          : y,
              dX         : dX,
              image      : image,
              speed      : message.speed,
              session_id : message.id
            });

            Game.map.addUnit(unit);
          }, 1000 * i);
        }
      break;
    }

    console.log(message);
  },

  addUnit: function() {
    Game.send({ 'action' : 'create_unit' });
  },

  launchWave: function() {
    $('unit-count').innerHTML = 0;
    Game.send({ 'action' : 'launch_wave' });
  },

  send: function(data) {
    Game.socket.send(JSON.stringify(data));
  }
};

var Map = function() {
  this.loadImages();
  this.createCanvas();
  this.bindEventListeners();
};

Map.prototype = {
  units  : [],
  towers : [],

  bindEventListeners: function() {
    window.addEventListener('resize', this.onResize.bind(this));
  },

  createCanvas: function() {
    this.body    = document.getElementsByTagName('body')[0];
    this.canvas  = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.width  = this.body.clientWidth;
    this.canvas.height = this.body.clientHeight;
    this.body.appendChild(this.canvas);
  },

  loadImages: function() {
    this.images = [];
    this.images[1] = new Image();
    this.images[1].src = '/images/robot-1.png';
    this.images[2] = new Image();
    this.images[2].src = '/images/robot-2.png';
  },

  render: function() {
    this.context.fillStyle = '#D7CFA1';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    /*for (var i = 0, l = this.towers.length; i < l; i++) {
      var tower = this.towers[i];

      if (tower) {
        tower.render(this.context);
      }
    }*/

    for (var i = 0, l = this.units.length; i < l; i++) {
      var unit = this.units[i];

      if (unit) {
        unit.update();
        unit.render(this.context);
      }
    }
  },


  onResize: function() {
    this.canvas.width  = this.body.clientWidth;
    this.canvas.height = this.body.clientHeight;
  },


  addUnit: function(unit) {
    unit.map = this;

    this.units.push(unit);
  },

  removeUnit: function(unit) {
    for (var i = 0, l = this.units.length; i < l; i++) {
      if (this.units[i] == unit) {
        this.units.splice(i, 1);
        break;
      }
    }
  }
};

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

var Unit = function(options) {
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

Unit.prototype = {
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

      this.map.removeUnit(this);
    }
  }
};

Game.connect();
