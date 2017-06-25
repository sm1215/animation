var creative = {
  svgns: "http://www.w3.org/2000/svg",
  width: 500,
  height: 500,
  speed: 2,
  radius: 20,
  circleLimit: 10,
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

    TweenMax.set(this.main, {
      width: this.width,
      height: this.height
    });

    TweenMax.set(this.svg, {
      attr: {
        width: this.width,
        height: this.height,
        viewBox: '0 0 '+ this.width +' '+ this.height
      }
    });
  },

  construct: function(){
    _.times(this.circleLimit, () => {
      var el = document.createElementNS(this.svgns, 'circle');

      TweenMax.set(el, {
        attr: {
          cx: 0,
          cy: 0,
          r: this.radius          
        }
      });

      this.circles.push(el);
      this.svg.appendChild(el);
    });
  },

  generateColor: function(){
    var values = [
      _.times(3, () => (
        _.random(0,255, false)
      )),
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
          cx: _.random(0, this.creative.width, false),
          cy: _.random(0, this.creative.height, false)
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