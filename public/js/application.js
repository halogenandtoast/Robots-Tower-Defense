var Map = function() {
  this.createCanvas();
  this.bindEventListeners();
};

Map.prototype = {
  towers: [],

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
  },

  onResize: function() {
    this.canvas.width  = this.body.clientWidth;
    this.canvas.height = this.body.clientHeight;
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




var socket = new io.Socket(window.location.hostname, { port: 8024 });

if (socket.connect()) {
  console.log('Connected.');

  var
  map = new Map();
  map.towers.push(new Tower(5, 5));
  map.towers.push(new Tower(15, 5));
  map.towers.push(new Tower(10, 10));

  setInterval(function() {
    map.render();
  }, 1000 / 30);
}




Function.prototype.bind = function(scope) {
  var _function = this;

  return function() {
    return _function.apply(scope, arguments);
  };
};
