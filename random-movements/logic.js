var creative = {
  svgns: "http://www.w3.org/2000/svg",
  width: 500,
  height: 500,
  speed: 1,
  radius: 40,
  circleLimit: 10,
  circles: [],
  tracking: false,

  initialize: function() {
    this.setDom();
    this.setBounds();
    this.setListeners();
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
      top: this.height / 4,
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

  setListeners: function(){
    window.addEventListener('mousemove', (e) => {
      var cx = e.clientX;
      var cy = e.clientY;
      var featureBounds = function(){
        return this.feature.getBoundingClientRect();
      }
      this.cx = cx - featureBounds().left;
      this.cy = cy - featureBounds().top;
      if(
        (cx > featureBounds().left && cy > featureBounds().top) &&
        (cx < featureBounds().right && cy > featureBounds().top) &&
        (cx < featureBounds().right && cy < featureBounds().bottom) &&
        (cx > featureBounds().left && cy < featureBounds().bottom)
      ){
        this.tracking = true;
      } else {
        this.tracking = false;
      }
    });
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

  animate: function(){

    var user = function(){
      return attr = {
        cx: this.creative.cx,
        cy: this.creative.cy,
        r: _.random(0, this.creative.radius, false)
      }
    }

    var random = function(){
      return attr = {
        cx: _.random(this.creative.radius, this.creative.width - this.creative.radius, false),
        cy: _.random(this.creative.radius, this.creative.height - this.creative.radius, false),
        r: _.random(0, this.creative.radius, false)
      }
    }

    var getMoveType = function(){
      return this.creative.tracking ? user() : random();
    }

    var getSpeed = function(){
      // return this.creative.tracking ? _.random(0, 2) : this.creative.speed;
      // return this.creative.tracking ? 1 : this.creative.speed;
      return this.creative.tracking ? 0.2 : this.creative.speed;
    }

    var getEasing = function(){
      return this.creative.tracking ? Circ.easeOut : Power0.easeNone;
      // return this.creative.tracking ? Elastic.easeOut : Power0.easeNone;
      // return this.creative.tracking ? Sine.easeOut : Power0.easeNone;
      // return this.creative.tracking ? Power0.easeNone : Power0.easeNone;
    }

    function move(circle){
      TweenMax.to(circle, getSpeed(), {
        fill: this.creative.generateColor(),
        attr: getMoveType(),
        ease: getEasing(),
        onComplete: move,
        onCompleteParams: [circle],
        onCompleteScope: this,
        onUpdate: function(circle, attr){
          if(this.creative.tracking){
            circle.duration(0.2);
            circle.updateTo({
              attr: {
                cx: this.creative.cx,
                cy: this.creative.cy //addGravity(this.creative.cy, attr.r)
              }
            }, true);
          } else {
            circle.duration(this.creative.speed);
          }

          function addGravity(cy, r){
            return cy += r*3;
          }
        },
        onUpdateParams: ['{self}', attr],
        onUpdateScope: this
      });
    }

    _.forEach(this.circles, (circle) => {
      move(circle);
    });
  }
}