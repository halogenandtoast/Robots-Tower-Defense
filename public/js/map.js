var Map = function() {
  this.loadImages();
  this.createCanvas();
  this.bindEventListeners();
};

Map.prototype = {
  robots  : [],
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

    for (var i = 0, l = this.robots.length; i < l; i++) {
      var robot = this.robots[i];

      if (robot) {
        robot.update();
        robot.render(this.context);
      }
    }
  },


  onResize: function() {
    this.canvas.width  = this.body.clientWidth;
    this.canvas.height = this.body.clientHeight;
  },


  addRobot: function(robot) {
    robot.map = this;

    this.robots.push(robot);
  },

  removeRobot: function(robot) {
    for (var i = 0, l = this.robots.length; i < l; i++) {
      if (this.robots[i] == robot) {
        this.robots.splice(i, 1);
        break;
      }
    }
  }
};
