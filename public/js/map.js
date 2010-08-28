var Map = function() {
  this.loadImages();
  this.createCanvas();
};

Map.prototype = {
  units  : [],
  towers : [],

  createCanvas: function() {
    this.body    = document.getElementsByTagName('body')[0];
    this.canvas  = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.width  = 800;
    this.canvas.height = 600;
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

  render: function() {
    this.context.drawImage(this.images[0], 0, 0);

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
