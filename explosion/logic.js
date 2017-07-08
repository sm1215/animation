var creative = {
  svgns: "http://www.w3.org/2000/svg",
  bounds: { width: 800, height: 600 },
  offset: { top: 0, right: 0, bottom: 0, left: 0 },
  cx: 0,
  cy: 0,
  duration: 1,
  radius: [
    //radii can be setup to give gradients a specific range
    { min: 50, max: 70 }, //red
    { min: 30, max: 50 }, //orange
    { min: 10, max: 30 } //yellow
  ],
  circleLimit: 50,
  speed: 1.25,
  gravity: 1.8,
  gradientDefinitions: [
    //gradients are layered,
    //the lower a gradient's index here, the lower it's z-index will be
    [
      //red
      { offset: '0%', color: 'rgba(188,0,0,1)' },
      { offset: '100%', color: 'rgba(204,125,0,1' }
    ],
    [
      //orange
      { offset: '0%', color: 'rgba(237,179,99,1)' },
      { offset: '100%', color: 'rgba(242,120,33,1)' }
    ],
    [
      //yellow
      { offset: '0%', color: 'rgba(255,206,84,1)' },
      { offset: '100%', color: 'rgba(251,255,153,1)' }
    ]
  ],
  circles: [],
  colors: [],

  initialize: function() {
    this.setup(['dom', 'bounds', 'offset', 'coords']);
    this.setListeners(['move']);
    this.construct(['gradients', 'circles']);
    this.animate();
  },

  setup: function(options){
    let types = {
      dom: function(){
        this.main = document.querySelector('#main-container');
        this.svg = document.querySelector('svg');
      },
      
      bounds: function(){
        TweenMax.set(this.main, {
          width: this.bounds.width,
          height: this.bounds.height,
          top: 100,
          opacity: 1
        });

        TweenMax.set(this.svg, {
          attr: {
            width: this.bounds.width,
            height: this.bounds.height,
            viewBox: `0 0 ${this.bounds.width} ${this.bounds.height}`
          },
          opacity: 1
        });
      },

      offset: function(){
        this.offset = _.pick(this.main.getBoundingClientRect(), ['top', 'right', 'bottom', 'left']);
      },

      coords: function(){
        this.cx = this.bounds.width / 2;
        this.cy = this.bounds.height / 2;
      }
    };

    _.forEach(options, (option) => { types[option].call(this); });
  },

  setListeners: function(options){
    let types = {
      move: function(){
        window.addEventListener('mousedown', (e) => {
          this.animate();
        });
        window.addEventListener('mousemove', (e) => {
          this.cx = e.clientX - this.offset.left;
          this.cy = e.clientY - this.offset.top;
        });
      }
    };

    _.forEach(options, (option) => { types[option].call(this); });
  },

  construct: function(options){
    let types = {
      gradients: function(){
        let defs = this.createElement('defs');

        _.forEach(this.gradientDefinitions, (gradDef, i) => {
          
          let gradient = this.createElement('radialGradient');
          TweenMax.set(gradient, { attr: { id: `gradient-${this.colors.length}` } });

          _.forEach(gradDef, (stopDef) => {
            let stop = this.createElement('stop');
            TweenMax.set(stop, {
              attr: {
                offset: stopDef.offset,
                'stop-color': stopDef.color
              }
            });
            gradient.appendChild(stop);
          });

          this.colors.push(gradient);
          defs.appendChild(gradient);
        });
    
        this.svg.insertBefore(defs, this.svg.firstChild);
      },

      circles: function(){
        _.times(this.circleLimit, (i) => {
          let el = this.createElement('circle');
          let radius = this.assignRadius(i);
          TweenMax.set(el, {
            attr: {
              opacity: 0,
              cx: this.cx,
              cy: this.cy,
              r: _.random(radius.min, radius.max),
              fill: this.assignGradient(i)
            }
          });

          this.circles.push(el);
          this.svg.appendChild(el);
        });
      }
    };

    _.forEach(options, (option) => { types[option].call(this); });
  },

  createElement: function(name){
    return document.createElementNS(this.svgns, name);
  },

  assignRadius: function(currentCircle){
    let radiusIndex = _.floor((currentCircle / this.circleLimit) * this.radius.length);
    return this.radius[radiusIndex];
  },

  assignGradient: function(currentCircle){
    let colorIndex = _.floor((currentCircle / this.circleLimit) * this.colors.length);
    return `url(#gradient-${colorIndex})`;
  },

  resetCircles: function(){
    _.forEach(this.circles, (circle, i) => {
      let radius = this.assignRadius(i);
      TweenMax.set(circle, {
        transform: '',
        attr: {
          r: _.random(radius.min, radius.max),
          cx: this.cx,
          cy: this.cy,
          opacity: 1
        }
      });
    });
  },

  animate: function(){

    this.resetCircles();

    function move(circle){
      let angle = Math.random() * Math.PI * 2;
      let degree = angle * -90 / Math.PI * 3;
      let velocity = (_.random(0.15, 1) * 500) * this.speed;
      let gravity = 700 * this.gravity;
      let radius = circle.getAttribute('r');

      TweenMax.to(circle, this.duration, {
        attr: {
          r: radius / 6,
          opacity: _.random(0.3, 0.7)
        },
        physics2D: {
          angle: degree,
          velocity: velocity,
          gravity: gravity
        },
        ease: Power4.easeOut,
        onComplete: function(circle){
          TweenMax.set(circle, {
            attr: {
              opacity: 0
            }
          });
        },
        onCompleteParams: [circle]
      });
    }

    _.forEach(this.circles, (circle) => { move.call(this, circle); });
  }
}