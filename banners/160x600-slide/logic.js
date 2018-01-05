/*
* ==================================================================================================
*   Creative Properties
* --------------------------------------------------------------------------------------------------
*   start:
*     Set during creative initialization. This is part of a timer used when measuring banner runtime upon completion.
*
*   container:
*     The main container of the banner. This is used when setting up bounds and needs to be defined.
*
*   classes:
*     An array of classnames of elements the index.html contains that you want to work with.
*     This is used in the setupDom function and will assign all classes in this array to the creative object (this).
*     These need to use camelCasing in order to reference them properly on the 'this' object.
*
*   bounds:
*     This is set automatically during initialization and is used when offsetting elements.
*
*   offset:
*     A list of parameters used in the offsetElements function. These help to control how elements are positioned initially offscreen and where they will move to.
*
*     - fromDir: [top, right, bottom, left]
*         The direction you want the element to slide in from.
*
*     - toDir: [top, right, bottom, left]
*         The direction you want the element to slide out to.
*
*     - modifier:
*         Any additonal pixels you want to add to the starting and ending offset values.
*
*   frames:
*     Optional parameter. Can be used in for loops later in the animate function to generate the appropriate number of frame timelines among other things.
*
*   devMode:
*     Boolean value. If true, the banner runtime can be console logged upon completion using the logRuntime function. If false, nothing is logged.
* ==================================================================================================
*/
var creative = {
  start: null,
  container: '#main-container',
  classes: ['feature', 'checkmark', 'checkline', 'text', 'logo', 'cta'],
  bounds: {},
  defaultOffset: {
    fromDir: 'bottom',
    toDir: 'right',
    modifier: 0
  },
  frames: 3,
  devMode: true,

  initialize: function() {
    this.start = window.performance.now();
    this.setupDom();
    this.setupBounds();

    //Example Usage 1:
    // Single Element
    // this.offsetElements(this.logo);

    // Example Usage 2:
    // Collection of Elements
    // this.offsetElements(this.text);

    // Example Usage 3:
    // Array of mixed collection / single Elements
    // this.offsetElements([this.text, this.logo, this.cta]);

    // Example Usage 5:
    // Array of mixed data - collection + objects with custom offsets that override the offset set at the creative level
    this.offsetElements([
      this.text,
      {
        el: this.logo,
        fromDir: 'top' //error: this is being assigned 'bottom' instead of 'top'
      },
      {
        el: this.cta,
        fromDir: 'bottom'
      }
    ]);

    this.animate();
  },

 /*
  * ==================================================================================================
  * Setup references to DOM elements as defined in creative.classes.
  * If multiple instances of an element are found, an array of those elements will be available on 'this'.
  * Else singular instances are set and can be accessed directly, instead of through array notation.
  * ==================================================================================================
  */
  setupDom: function() {
    for (var i = 0; i < this.classes.length; i++) {
      this[this.classes[i]] = document.querySelectorAll('.' + this.classes[i]);
      if(this[this.classes[i]].length <= 1){
        this[this.classes[i]] = this[this.classes[i]][0];
      }
    }
  },

 /*
  * ==================================================================================================
  * Setup dimensions of the banner. These are based on having a container wrapper available in index.html.
  * If no container is found, a warning is issued and elements will not offset properly, however they can still be animated by other means (opacity).
  * ==================================================================================================
  */
  setupBounds: function(){
    var container = document.querySelector(this.container);
    if(container){
      this.bounds.width = container.getBoundingClientRect().width;
      this.bounds.height = container.getBoundingClientRect().height;
    } else {
      console.warn('Couldn\'t find container when setting bounds.');
    }
  },

 /*
  * ==================================================================================================
  * Will offset elements based on the parameters specified by the user.
  * This will assign start, rest, and end positions to each element.
  * This will also move elements to the start position through a hard set (not animated).
  * Can accept
  *  - A single element, or an array of objects keyed with elements and offset objects.
  *      offsetElements(this.el);
  *  - An array of elements
  *      offsetElements([this.el1, this.el2]);
  *  - An array of objects keyed with elements and (optional) offset objects
  *      offsetElements([{ el: this.el1 }, { el: this.el2, offset: { fromDir: 'right', toDir: 'left', modifier: 10 }}]);
  * ==================================================================================================
  */
  offsetElements: function(obj){
    var el;
    //replaced with the ternary below, need to test this in all use cases before removing commented code
    // if(obj.length){
    //   el = obj;
    // } else {
    //   el = [obj];
    // }
    obj.length ? el = obj : el = [obj];

    // console.log("el", el);

    for(var i = 0; i < el.length; i++){
      var elI = getEl(el[i]);
      // Check if we're working with a collection
      if(elI.length > 1){
        for (var j = 0; j < elI.length; j++) {
          var elJ = getEl(elI[j]);
          elJ = getKeys.call(this, elI[j], this.defaultOffset); //getKeys is being called too many times on singular objects
          setPositions.call(this, elJ);
        }
      } else{
        elI = getKeys.call(this, elI, this.defaultOffset);
        setPositions.call(this, elI);
      }
    }

    function getEl(obj){
      return obj.el ? obj.el : obj;
    }

    // Checks 'a' object against 'b' object. Anything 'a' object is missing is filled in by 'b' object
    function getKeys(a, b){
      var bKeys = Object.keys(b);
      for(var i = 0; i < bKeys.length; i++){
        var bk = bKeys[i];
        // console.log("obj", a, 'key', bk, 'check', a.hasOwnProperty(bk)); //this check is failing on every obj on test 5
        if(!a.hasOwnProperty(bk)){
          a[bk] = b[bk];
        }
      }
      return a;
    }

    function setPositions(el){
      el.fromMeasure = getMeasure(el.fromDir); //start
      el.toMeasure = getMeasure(el.toDir); //end
      el.fromAnimate = getAnimate(el.fromDir); //start
      el.toAnimate = getAnimate(el.toDir); //rest
      el.startPosition = el.getBoundingClientRect()[el.fromAnimate] + el.getBoundingClientRect()[el.fromMeasure] + el.modifier;
      el.restPosition = parseInt(getComputedStyle(el)[el.fromAnimate]);
      el.endPosition = el.getBoundingClientRect()[el.toMeasure] + el.modifier;
      if(el.fromDir == 'left' || el.fromDir == 'top'){
        el.startPosition = -Math.abs(el.startPosition);
      }
      if(el.toDir == 'left' || el.toDir == 'top'){
        el.endPosition = -Math.abs(el.endPosition);
      }
      el.style[el.fromAnimate] = el.startPosition + 'px';
    }

    // returns 'height' or 'width' depending on property being used
    function getMeasure(prop){
      return (prop == 'top' || prop == 'bottom') ? 'height' : (prop == 'left' || prop == 'right') ? 'width' : false;
    }

    // returns 'top' or 'left' depending on property being used
    function getAnimate(prop){
      return (prop == 'top' || prop == 'bottom') ? 'top' : (prop == 'left' || prop == 'right') ? 'left' : false;
    }
  },

 /*
  * ==================================================================================================
  * All animation goes here
  * ==================================================================================================
  */
  animate: function(){
    var timeline = new TimelineMax({ onComplete: this.logRuntime });
    var frames = [];
    var texts = [];
    var checklines = [];
    var logo, cta, bg;

    for (var i = 0; i < this.frames; i++) {
      frames.push(new TimelineMax());
    }

    for (var i = 0; i < this.text.length; i++) {
      var el = this.text[i];
      texts.push({
        enter: TweenMax.to(el, 0.8, { opacity:1, [el.fromAnimate]: el.restPosition }),
        exit: TweenMax.to(el, 0.7, { opacity:0, [el.toAnimate]: el.endPosition })
      });
    }

    for (var i = 0; i < this.checkline.length; i++) {
      checklines.push({
        enter: TweenMax.to(this.checkline[i], 0.5, { opacity:1, 'stroke-dashoffset': 0 }),
        exit: TweenMax.to(this.checkmark[i], 0.5, { opacity:0, left:'-100px' })
      });
    }

    logo = TweenMax.to(this.logo, 1.1, { opacity:1, [this.logo.fromAnimate]: this.logo.restPosition });
    cta = TweenMax.to(this.cta, 1.1, { opacity:1, [this.cta.fromAnimate]: this.cta.restPosition });
    bg = TweenMax.to(this.feature, 1, { backgroundColor: '#fff' });

    frames[0].add([texts[0].enter, checklines[0].enter], '+=0', 'sequence', 0.5);
    frames[0].add([texts[1].enter, checklines[1].enter], '+=0', 'sequence', 0.5);
    frames[0].add([texts[2].enter, checklines[2].enter], '+=0', 'sequence', 0.5);
    frames[0].add([checklines[0].exit, texts[0].exit], '+=1', 'sequence', '-=0.4');
    frames[0].add([checklines[1].exit, texts[1].exit], '-=0.7', 'sequence', '-=0.4');
    frames[0].add([checklines[2].exit, texts[2].exit], '-=0.7', 'sequence', '-=0.4');

    frames[1].add([texts[3].enter], '+=0', 'sequence', 1);
    frames[1].add([texts[3].exit], '+=1.65');
    frames[1].add(bg);

    frames[2].add([logo, cta], '+=0', 'start', 0);

    timeline.add(frames, '+=0', 'sequence', 0);
    timeline.play();
  },

  logRuntime: function(){
    if(creative.devMode){
      console.log('end', window.performance.now() - creative.start);
    }
  }
}