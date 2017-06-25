var creative = {
  svgns: "http://www.w3.org/2000/svg",
  width: 700,
  height: 700,
  speed: 1,
  radius: 40,
  circleLimit: 100,
  circles: [],
  tracking: false,
  listeners: ['move', 'click'],

  initialize: function() {
    this.setDom();
    this.setBounds();
    this.setListeners(this.listeners);
    this.construct();
    this.animate();
  },

  setDom: function() {
    this.main = document.querySelector('#main-container');
    this.feature = document.querySelector('#feature');
    this.svg = document.querySelector('svg');
  },

  setBounds: function(){
    TweenMax.set(this.main, {
      width: this.width,
      height: this.height,
      top: 100,
      opacity: 1
    });

    TweenMax.set(this.svg, {
      attr: {
        width: this.width,
        height: this.height,
        viewBox: `0 0 ${this.width} ${this.height}`
      },
      opacity: 1
    });
  },

  setListeners: function(options){
    var types = {
      move: function(thisObj){
        window.addEventListener('mousemove', (e) => {
          var cx = e.clientX;
          var cy = e.clientY;
          var featureBounds = function(){
            return thisObj.feature.getBoundingClientRect();
          }
          thisObj.cx = cx - featureBounds().left;
          thisObj.cy = cy - featureBounds().top;
          if(
            (cx > featureBounds().left && cy > featureBounds().top) &&
            (cx < featureBounds().right && cy > featureBounds().top) &&
            (cx < featureBounds().right && cy < featureBounds().bottom) &&
            (cx > featureBounds().left && cy < featureBounds().bottom)
          ){
            thisObj.tracking = true;
            TweenMax.to(thisObj.svg, 0.5, {
              backgroundColor: 'rgba(255,255,150,0.3)'
            });
          } else {
            thisObj.tracking = false;
            TweenMax.to(thisObj.svg, 0.5, {
              backgroundColor: 'transparent'
            });
          }
        });
      },

      click: function(thisObj){
        window.addEventListener('mousedown', (e) => {
          thisObj.tracking = true;
        });
        window.addEventListener('mouseup', (e) => {
          thisObj.tracking = false;
        });
      }
    }

    var thisObj = this;
    _.forEach(options, (option) => { types[option](thisObj) });
  },

  construct: function(){
    _.times(this.circleLimit, () => {
      var el = document.createElementNS(this.svgns, 'circle');

      TweenMax.set(el, {
        attr: {
          cx: _.random(0, this.width - this.radius, false),
          cy: _.random(0, this.height - this.radius, false),
          r: this.radius          
        }
      });

      this.circles.push(el);
      this.svg.appendChild(el);
    });
  },

  generateColor: function(){
    var values = [
      _.times(3, () => (_.random(0,255, false))),
      _.round(_.random(0.3,1), 2)
    ];
    return `rgba(${values.join(',')})`;
  },

  user: function(){
    return attr = {
      cx: this.cx,
      cy: this.cy,
      r: _.random(0, this.radius, false)
    }
  },

  random: function(){
    return attr = {
      cx: _.random(this.radius, this.width - this.radius, false),
      cy: _.random(this.radius, this.height - this.radius, false),
      r: _.random(0, this.radius, false)
    }
  },

  getMoveType: function(){
    return this.tracking ? this.user() : this.random();
  },

  getSpeed: function(){
    return this.tracking ? 0.2 : this.speed;
  },

  getEasing: function(){
    return this.tracking ? Circ.easeOut : Power0.easeNone;
    // return this.tracking ? Elastic.easeOut : Power0.easeNone;
    // return this.tracking ? Sine.easeOut : Power0.easeNone;
    // return this.tracking ? Power0.easeNone : Power0.easeNone;
  },

  animate: function(){

    function move(circle){
      TweenMax.to(circle, this.creative.getSpeed(), {
        fill: this.creative.generateColor(),
        attr: this.creative.getMoveType(),
        ease: this.creative.getEasing(),
        onComplete: move,
        onCompleteParams: [circle],
        onCompleteScope: this,
        onUpdate: function(circle){
          circle.duration(this.creative.getSpeed());
          if(this.creative.tracking){
            this.creative.wasTracking = true;
            circle.updateTo({
              attr: this.creative.getMoveType(),
            }, true);
          } else if(this.creative.wasTracking){
            this.creative.wasTracking = false;
            circle.updateTo({
              attr: this.creative.getMoveType()
            });
          }
        },
        onUpdateParams: ['{self}'],
        onUpdateScope: this
      });
    }

    _.forEach(this.circles, function(circle){
      move(circle);
    });
  }
}