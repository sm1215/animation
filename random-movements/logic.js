var creative = {
  svgns: "http://www.w3.org/2000/svg",
  width: 500,
  height: 500,
  speed: 2,
  radius: 40,
  circleLimit: 50,
  circles: [],

  initialize: function() {
    this.setDom();
    this.setBounds();
    this.construct();
    this.animate();
  },

  setDom: function() {
    this.main = document.querySelector('#main-container');
    this.svg = document.querySelector('svg');
  },

  setBounds: function(){

    TweenMax.to(this.main, this.speed, {
      width: this.width,
      height: this.height,
      top: this.height / 4,
      opacity: 1
    });

    TweenMax.to(this.svg, this.speed, {
      attr: {
        width: this.width,
        height: this.height,
        viewBox: '0 0 '+ this.width +' '+ this.height
      },
      opacity: 1
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

  // generateColor: () => (
  //   `rgba(${
  //     [
  //       _.times(3, () => (
  //         this.creative.randomColor())
  //       ),
  //       this.creative.randomOpacity()
  //     ].join(',')
  //   })`
  // ),

  animate: function(){

    function move(circle){
      TweenMax.to(circle, this.creative.speed, {
        fill: this.creative.generateColor(),
        attr: {
          cx: _.random(this.creative.radius, this.creative.width - this.creative.radius, false),
          cy: _.random(this.creative.radius, this.creative.height - this.creative.radius, false),
          r: _.random(0, this.creative.radius, false),
        },
        ease: Power0.easeNone,
        onComplete: move,
        onCompleteParams: [circle],
        onCompleteScope: this
      });
    }

    _.forEach(this.circles, (circle) => {
      move(circle);
    });
  }
}