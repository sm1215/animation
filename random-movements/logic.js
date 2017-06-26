var creative = {
  svgns: "http://www.w3.org/2000/svg",
  width: 700,
  height: 700,
  speed: 1,
  radius: 40,
  circleLimit: 50,
  circles: [],
  colorLimit: 50,
  colors: [],
  tracking: false,
  // listeners: ['move', 'click'],
  listeners: ['click'],

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
          var featureBounds = function(){
            return thisObj.feature.getBoundingClientRect();
          }
          thisObj.cx = e.clientX - featureBounds().left;
          thisObj.cy = e.clientY - featureBounds().top;
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
   
    var defs = createElement('defs');
    
    _.times(this.colorLimit, () => {
      var gradient = createElement('radialGradient');
      var stopZero = createElement('stop');
      var stopOne = createElement('stop');
      var stopTwo = createElement('stop');
      var stopThree = createElement('stop');

      TweenMax.set(gradient, { attr: { id: `gradient-${this.colors.length}` } });
      TweenMax.set(stopZero, { 
        attr: { 
          offset: '10%',
          'stop-color': this.generateColor({ 
              colorRange: { min:200, max:255 }, 
              opacityRange: { min: 0.1, max: 0.2 }
            })
        }
      });
      TweenMax.set(stopOne, { 
        attr: { 
          offset: '30%',
          'stop-color': this.generateColor({ 
              colorRange: { min:150, max:255 }, 
              opacityRange: { min: 0.2, max: 0.4 } 
            })
        }
      });
      TweenMax.set(stopTwo, { 
        attr: { 
          offset: '60%',
          'stop-color': this.generateColor({ 
              colorRange: { min:0, max:255 }, 
              opacityRange: { min: 0.5, max: 0.6 } 
            })
        }
      });
      TweenMax.set(stopThree, { 
        attr: { 
          offset: '98%',
          'stop-color': this.generateColor({ 
              colorRange: { min:0, max:70 }, 
              opacityRange: { min: 0.8, max: 0.9 } 
            })
        }
      });

      gradient.appendChild(stopZero);
      gradient.appendChild(stopOne);
      gradient.appendChild(stopTwo);
      gradient.appendChild(stopThree);
      this.colors.push(gradient);
    });

    _.forEach(this.colors, (gradient) => {
      defs.appendChild(gradient);
    });

    this.svg.appendChild(defs);

    _.times(this.circleLimit, () => {
      var el = createElement('circle');

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

    function createElement(name){
      return document.createElementNS(this.creative.svgns, name);
    }
  },

  generateColor: function({colorRange, opacityRange}){
    var values = [
      _.times(3, () => (_.random(colorRange.min, colorRange.max, false))),
      _.round(_.random(opacityRange.min, opacityRange.max), 2)
    ];
    return `rgba(${values.join(',')})`;
  },

  assignGradient: function(){
    return `url(#gradient-${_.random(0, this.colors.length - 1, false)})`;
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

    _.forEach(this.circles, (circle) => {
      TweenMax.set(circle, {
        attr: {
          fill: this.assignGradient()
        }
      });
    });

    function move(circle){
      TweenMax.to(circle, this.creative.getSpeed(), {
        // fill: this.creative.generateColor(),
        // fill: this.creative.assignGradient(),
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