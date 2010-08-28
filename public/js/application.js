Function.prototype.bind = function(scope) {
  var _function = this;

  return function() {
    return _function.apply(scope, arguments);
  };
};




var Game = function() {
  this.createSocket();
};

Game.prototype = {
  bindEventListeners: function() {
    var $ = function(id) { return document.getElementById(id); };

    $('add-unit').addEventListener('click', function(event) {
      this.addUnit();

      event.preventDefault();
    }.bind(this));

    $('launch-wave').addEventListener('click', function(event) {
      this.launchWave();

      event.preventDefault();
    }.bind(this));
  },

  createSocket: function() {
    this.socket = new io.Socket(window.location.hostname, { port: 8024 });
    this.socket.on('message', this.onMessage.bind(this));

    if (this.socket.connect()) {
      this.onConnect();

      // TEMPORARY
      var
      map = new Map();
      map.addUnit(new Unit(18, 7));
      map.towers.push(new Tower(5, 5));
      map.towers.push(new Tower(15, 5));
      map.towers.push(new Tower(10, 10));

      setInterval(function() {
        map.render();
      }, 1000 / 30);
    }
  },


  onConnect: function() {
    this.bindEventListeners();
  },

  onMessage: function(message) {
    console.log(message);
  },


  addUnit: function() {
    this.send({ 'action' : 'create_unit' });
  },

  launchWave: function() {
    this.send({ 'action' : 'launch_wave' });
  },

  send: function(data) {
    this.socket.send(JSON.stringify(data));
  }
};

var Map = function() {
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

  render: function() {
    this.context.fillStyle = '#444';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (var i = 0, l = this.towers.length; i < l; i++) {
      var
      tower = this.towers[i];
      tower.render(this.context);
    }

    for (var i = 0, l = this.units.length; i < l; i++) {
      var
      unit = this.units[i];
      unit.update();
      unit.render(this.context);
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

var Unit = function(x, y) {
  this.x       = x;
  this.y       = y;
  this.dX      = -1;
  this.dY      = 0;
  this.speed   = 2;
  this.offsetX = 0;
  this.offsetY = 0;
};

Unit.prototype = {
  render: function(context) {
    var x = (this.x * 32) + this.offsetX;
    var y = (this.y * 32) + this.offsetY;

    context.fillStyle = '#00C';
    context.fillRect(x, y, 32, 32);
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

    if (this.x < 0 || this.y < 0) {
      this.map.removeUnit(this);
    }
  }
};

new Game();
