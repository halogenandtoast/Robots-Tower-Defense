var Map = function() {
  this.createCanvas();
  this.bindEventListeners();
};

Map.prototype = {
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
  },

  onResize: function() {
    this.canvas.width  = this.body.clientWidth;
    this.canvas.height = this.body.clientHeight;
  }
};

var socket = new io.Socket(window.location.hostname, { port: 8024 });

if (socket.connect()) {
  console.log('Connected.');

  var map = new Map();

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
