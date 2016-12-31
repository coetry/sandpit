'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Vector = exports.Color = exports.Mathematics = exports.Is = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dat = require('dat.gui/build/dat.gui');

var _dat2 = _interopRequireDefault(_dat);

var _queryfetch = require('queryfetch');

var _queryfetch2 = _interopRequireDefault(_queryfetch);

var _debounce = require('debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _seedrandom = require('seedrandom');

var _seedrandom2 = _interopRequireDefault(_seedrandom);

var _logger = require('./utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _Is = require('./utils/Is');

var _Is2 = _interopRequireDefault(_Is);

var _Color = require('./utils/Color');

var _Color2 = _interopRequireDefault(_Color);

var _Mathematics = require('./utils/Mathematics');

var _Mathematics2 = _interopRequireDefault(_Mathematics);

var _Vector = require('./utils/Vector');

var _Vector2 = _interopRequireDefault(_Vector);

require('whatwg-fetch');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global fetch */

/**
 * A playground for creative coding
 */
var Sandpit = function () {
  _createClass(Sandpit, null, [{
    key: 'CANVAS',
    get: function get() {
      return '2d';
    }
  }, {
    key: 'WEBGL',
    get: function get() {
      return '3d';
    }

    /**
     * @param {(string|object)} container - The container for the canvas to be added to
     * @param {string} type - Defines whether the context is 2d or 3d
     * @param {boolean} retina - Optionally decide to ignore rescaling for retina displays
     */

  }]);

  function Sandpit(container, type) {
    var retina = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    _classCallCheck(this, Sandpit);

    _logger2.default.info('⛱ Welcome to Sandpit');
    this._setupContext(container, type, retina);
  }

  /**
   * Set up the canvas
   * @private
   */


  _createClass(Sandpit, [{
    key: '_setupContext',
    value: function _setupContext(container, type, retina) {
      // Check that the correct container type has been passed
      if (typeof container !== 'string' && (typeof container === 'undefined' ? 'undefined' : _typeof(container)) !== 'object') {
        throw new Error('Please provide a string or object reference to the container, like ".container", or document.querySelector(".container")');
      }
      // Check that the type is set
      if (typeof type !== 'string' || type !== Sandpit.CANVAS && type !== Sandpit.WEBGL) {
        throw new Error('Please provide a context type - either `Sandpit.CANVAS` or `Sandpit.WEBGL`');
      }

      // Either find the container, or just use the object
      var _container = void 0;
      if (typeof container === 'string') {
        _container = document.querySelector(container);
      } else if ((typeof container === 'undefined' ? 'undefined' : _typeof(container)) === 'object') {
        _container = container;
      }

      // Check the container is a dom element
      if (_Is2.default.element(_container)) {
        // Check the container is a canvas element
        // and if so, use it instead of making a new one
        if (_Is2.default.canvas(_container)) {
          this._canvas = _container;
        } else {
          this._canvas = document.createElement('canvas');
          _container.appendChild(this._canvas);
        }
        // Set the width and height
        this._canvas.width = window.innerWidth;
        this._canvas.height = window.innerHeight;
        // Grab the context
        this._context = this._canvas.getContext(type);
        this._type = type;

        // Deal with retina displays
        if (type === Sandpit.CANVAS && window.devicePixelRatio !== 1 && retina) {
          var ratio = window.devicePixelRatio;
          // Increaser the canvas by the ratio
          this._canvas.width = window.innerWidth * ratio;
          this._canvas.height = window.innerHeight * ratio;
          // Set the canvas to the actual size
          this._canvas.style.width = window.innerWidth + 'px';
          this._canvas.style.height = window.innerHeight + 'px';
          // Scale the canvas to the new ratio
          // TODO: Add canvas support to jsdom to avoid having
          // to if-statement this bit
          if (this._context) this._context.scale(ratio, ratio);
        }
      } else {
        throw new Error('The container is not a HTMLElement');
      }
    }

    /**
     * Sets up the settings gui via dat.gui
     * @param {object} settings - An object of key value pairs
     * for the setting name and default value
     * @param {boolean} queryable - Whether or not to store settings
     * in the query string for easy sharing
     * @private
     */

  }, {
    key: '_setupSettings',
    value: function _setupSettings() {
      var _this = this;

      this.settings = {};
      this._gui = new _dat2.default.GUI();
      this._gui.domElement.addEventListener('touchmove', this._preventDefault, false);

      // If queryable is true, set up the query string management
      // for storing settings
      if (this._queryable) {
        if (window.location.search) {
          (function () {
            var params = _queryfetch2.default.parse(window.location.search);
            Object.keys(params).forEach(function (key) {
              // If a setting matches the param, use the param
              if (_this.defaults[key]) {
                var param = params[key];
                // Convert string to boolean if 'true' or 'false'
                if (param === 'true') param = true;
                if (param === 'false') param = false;
                if (_typeof(_this.defaults[key].value) !== 'object') {
                  // If sticky is true, stick with the default setting
                  // otherwise set the default to the param
                  if (!_this.defaults[key].sticky) {
                    _this.defaults[key].value = param;
                  }
                } else {
                  // If the param is an object, store the
                  // name in a selected property
                  if (!_this.defaults[key].sticky) {
                    _this.defaults[key].selected = param;
                  } else {
                    // If sticky is true, force the default setting
                    _this.defaults[key].selected = _this.defaults[key].value[Object.keys(_this.defaults[key].value)[0]];
                  }
                }
              }
            });
          })();
        }
      }

      // Create settings folder and add each item to it
      var group = this._gui.addFolder('Settings');
      Object.keys(this.defaults).forEach(function (name) {
        var options = false;
        var value = _this.defaults[name].value;

        // If it's an object, supply the array or object,
        // and grab the right value
        if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
          options = value;
          // If a selected option is available via the query
          // string, use that
          if (_this.defaults[name].selected) {
            _this.settings[name] = _this.defaults[name].selected;
          } else {
            // If not, grab the first item in the object or array
            _this.settings[name] = _Is2.default.array(value) ? value[0] : value[Object.keys(value)[0]];
          }
        } else {
          // If it's not an object, pass the setting on
          _this.settings[name] = _this.defaults[name].value;
        }

        // If it's a colour, use a different method
        var guiField = _this.defaults[name].color ? group.addColor(_this.settings, name) : group.add(_this.settings, name, options);

        // Check for min, max and step, and add to the gui field
        if (_this.defaults[name].min !== undefined) guiField = guiField.min(_this.defaults[name].min);
        if (_this.defaults[name].max !== undefined) guiField = guiField.max(_this.defaults[name].max);
        if (_this.defaults[name].step !== undefined) guiField = guiField.step(_this.defaults[name].step);
        if (_this.defaults[name].editable === false) {
          guiField.domElement.style.pointerEvents = 'none';
          guiField.domElement.style.opacity = 0.5;
        }

        // Handle the change event
        guiField.onChange((0, _debounce2.default)(function (value) {
          _this._change(name, value);
        }), 300);
      });
      // Open the settings drawer
      group.open();

      // Hide controls for mobile
      // TODO: Make this a setting
      if (this.width() <= 767) {
        this._gui.close();
      }

      // If queryable is enabled, serialize the final settings
      // and push them to the query string
      if (this._queryable) {
        var query = _queryfetch2.default.serialize(this.settings);
        window.history.replaceState({}, null, '/?' + query);
        // Adds a clear and reset button to the gui interface
        this._gui.add({ clear: function clear() {
            _this.clear();
          } }, 'clear');
        this._gui.add({ reset: function reset() {
            _this._reset();
          } }, 'reset');
      }
    }

    /**
     * Resets the settings in the query string, and offers a hook
     * to do something more fancy with sandpit.reset
     * @private
     */

  }, {
    key: '_reset',
    value: function _reset() {
      if (this._queryable) {
        if (this.reset) {
          // If there's a reset method available, run that
          this.reset();
        } else {
          // If queryable, clear the query string
          window.history.replaceState({}, null, '/');
          // Reload the video
          window.location.reload();
        }
      }
    }

    /**
     * Handles a changed setting
     * @param {string} name - Setting name
     * @param {*} value - The new setting value
     * @private
     */

  }, {
    key: '_change',
    value: function _change(name, value) {
      _logger2.default.info('Update fired on ' + name + ': ' + value);
      if (this._queryable) {
        var query = _queryfetch2.default.serialize(this.settings);
        window.history.pushState({}, null, '/?' + query);
      }
      // If there is a change hook, use it
      if (this.change) {
        this.change(name, value);
      }
    }

    /**
     * Sets up the primary animation loop
     * @private
     */

  }, {
    key: '_setupLoop',
    value: function _setupLoop() {
      this._time = 0;
      this._loop();
    }

    /**
     * The primary animation loop
     * @private
     */

  }, {
    key: '_loop',
    value: function _loop() {
      // Clear the canvas if autoclear is set
      if (this._autoClear) {
        if (this._type === Sandpit.CANVAS) {
          this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        } else if (this._type === Sandpit.WEGBL) {
          _logger2.default.warn('autoClear() is currently only supported in 2D');
        }
      }
      // Loop!
      if (this.loop) this.loop();
      // Increment time
      this._time++;
      this._animationFrame = window.requestAnimationFrame(this._loop.bind(this));
    }

    /**
     * Sets up event management
     * @private
     */

  }, {
    key: '_setupEvents',
    value: function _setupEvents() {
      var _this2 = this;

      this._events = {};
      this._setupResize();
      this._setupInput();

      // Loop through and add event listeners
      Object.keys(this._events).forEach(function (event) {
        if (_this2._events[event].disable) {
          // If the disable property exists, add prevent default to it
          _this2._events[event].disable.addEventListener(event, _this2._preventDefault, false);
        }
        _this2._events[event].context.addEventListener(event, _this2._events[event].event.bind(_this2), false);
      });
    }

    /**
     * Sets up the resize event, optionally using a user defined option
     * @private
     */

  }, {
    key: '_setupResize',
    value: function _setupResize() {
      this._resizeEvent = this.resize ? this.resize : this.resizeCanvas;
      this._events['resize'] = { event: this._resizeEvent, context: window };
    }

    /**
     * Hooks up the mouse events
     * @private
     */

  }, {
    key: '_setupMouse',
    value: function _setupMouse() {
      this._events['mousemove'] = { event: this._handleMouseMove, context: document };
      this._events['mousedown'] = { event: this._handleMouseDown, context: document };
      this._events['mouseenter'] = { event: this._handleMouseEnter, context: document };
      this._events['mouseleave'] = { event: this._handleMouseLeave, context: document };
      this._events['mouseup'] = { event: this._handleMouseUp, context: document };
    }

    /**
     * Hooks up the touch events
     * @private
     */

  }, {
    key: '_setupTouches',
    value: function _setupTouches() {
      var body = document.querySelector('body');
      this._events['touchmove'] = { event: this._handleTouchMove, disable: document, context: body };
      this._events['touchstart'] = { event: this._handleTouchStart, disable: document, context: body };
      this._events['touchend'] = { event: this._handleTouchEnd, disable: document, context: body };
    }

    /**
     * Stops an event bubbling up
     * @private
     */

  }, {
    key: '_stopPropagation',
    value: function _stopPropagation(event) {
      event.stopPropagation();
    }

    /**
     * Stops an event firing its default behaviour
     * @private
     */

  }, {
    key: '_preventDefault',
    value: function _preventDefault(event) {
      event.preventDefault();
    }

    /**
     * Hooks up the accelerometer events
     * @private
     */

  }, {
    key: '_setupAccelerometer',
    value: function _setupAccelerometer() {
      if (window.DeviceOrientationEvent) {
        this._events['deviceorientation'] = { event: this._handleAccelerometer, context: window };
      } else {
        _logger2.default.warn('Accelerometer is not supported by this device');
      }
    }

    /**
     * Defines the input object and sets up the mouse, accelerometer and touches
     * @param {event} event
     * @private
     */

  }, {
    key: '_setupInput',
    value: function _setupInput() {
      this.input = {};
      this._setupMouse();
      this._setupTouches();
      this._setupAccelerometer();
    }

    /**
     * Handles the mousemove event
     * @param {event} event
     * @private
     */

  }, {
    key: '_handleMouseMove',
    value: function _handleMouseMove(event) {
      event.touches = {};
      event.touches[0] = event;
      this._handleTouches(event);
      if (this.move) this.move(event);
    }

    /**
     * Handles the mousedown event
     * @param {event} event
     * @private
     */

  }, {
    key: '_handleMouseDown',
    value: function _handleMouseDown(event) {
      event.touches = {};
      event.touches[0] = event;
      this._handleTouches(event);
      if (this.touch) this.touch(event);
    }

    /**
     * Handles the mouseup event
     * @param {event} event
     * @private
     */

  }, {
    key: '_handleMouseUp',
    value: function _handleMouseUp(event) {
      this._handleRelease();
      if (this.release) this.release(event);
    }

    /**
     * Handles the mouseenter event
     * @param {event} event
     * @private
     */

  }, {
    key: '_handleMouseEnter',
    value: function _handleMouseEnter(event) {
      this.input.inFrame = true;
    }

    /**
     * Handles the mouseleave event
     * @param {event} event
     * @private
     */

  }, {
    key: '_handleMouseLeave',
    value: function _handleMouseLeave(event) {
      this.input.inFrame = false;
    }

    /**
     * Handles the touchmove event
     * @param {event} event
     * @private
     */

  }, {
    key: '_handleTouchMove',
    value: function _handleTouchMove(event) {
      // So, event.preventDefault() seems required to prevent pinching,
      // but sometimes pinches still rarely happen (3 - 5 fingers), so
      // is there a way to avoid this? Currently added a
      // focusTouchesOnCanvas() method to blow away all other
      // touch events, for use outside the demo environment,
      // but this isn't really a viable solution. If possible,
      // I'd use the bit below, but I've commented it out for now:
      // this._focusTouchesOnCanvas ? event.preventDefault() : event.stopPropagation()
      event.preventDefault();
      this._handleTouches(event);
      if (this.move) this.move(event);
    }

    /**
     * Handles the touchstart event
     * @param {event} event
     * @private
     */

  }, {
    key: '_handleTouchStart',
    value: function _handleTouchStart(event) {
      this._focusTouchesOnCanvas ? event.preventDefault() : event.stopPropagation();
      this._handleTouches(event);
      if (this.touch) this.touch(event);
    }

    /**
     * Handles the touchend event
     * @param {event} event
     * @private
     */

  }, {
    key: '_handleTouchEnd',
    value: function _handleTouchEnd(event) {
      this._focusTouchesOnCanvas ? event.preventDefault() : event.stopPropagation();
      this._handleTouches(event);
      if (this.release) this.release(event);
    }

    /**
     * Handles the accelerometer event
     * @param {event} event
     * @private
     */

  }, {
    key: '_handleAccelerometer',
    value: function _handleAccelerometer(event) {
      if (event.beta && event.alpha && event.gamma) {
        this.input.accelerometer = {
          xAxis: event.beta,
          yAxis: event.gamma,
          rotation: event.alpha,
          gamma: event.gamma,
          beta: event.beta,
          alpha: event.alpha
        };
      }
      if (this.accelerometer) this.accelerometer(event);
    }

    /**
     * Handles a set of touches
     * @param {object} touches - An object containing touch information, in
     * the format {0: TouchItem, 1: TouchItem}
     */

  }, {
    key: '_handleTouches',
    value: function _handleTouches(event) {
      var _this3 = this;

      // Delete the length parameter from touches,
      // so we can loop through it
      delete event.touches.length;
      if (Object.keys(event.touches).length) {
        var touches = Object.keys(event.touches).map(function (key, i) {
          // Set the X & Y for input from the first touch
          if (i === 0) {
            _this3.input.x = event.touches[key].pageX;
            _this3.input.y = event.touches[key].pageY;
          }

          var touch = {};
          // If there is previous touch, store it as a helper
          if (_this3.input.touches && _this3.input.touches[key]) {
            touch.previousX = _this3.input.touches[key].x;
            touch.previousY = _this3.input.touches[key].y;
          }
          // Store the x and y
          touch.x = event.touches[key].pageX;
          touch.y = event.touches[key].pageY;
          // If force is available, add it
          if (event.touches[key].force) touch.force = event.touches[key].force;
          return touch;
        });
        // Update the touches
        this.input.touches = touches;
      } else {
        this._handleRelease();
      }
    }

    /**
     * Deletes the appropriate data from inputs on release
     * @param {object} pointer - An object containing pointer information,
     * in the format of {pageX: x, pageY: y}
     */

  }, {
    key: '_handleRelease',
    value: function _handleRelease() {
      delete this.input.x;
      delete this.input.y;
      delete this.input.touches;
    }

    /**
     * Creates the settings GUI
     * @param {object} settings - An object containing key value pairs for each setting
     * @param {boolean} queryable - Enables query string storage of settings
     * @return {object} Context
     */

  }, {
    key: 'settings',
    value: function settings(_settings) {
      var queryable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      this.defaults = _settings;
      this._queryable = queryable;
    }

    /**
     * Defines whether or not to return debugger messages from Sandpit
     * @param {boolean} boolean
     * @return {object} Context
     */

  }, {
    key: 'debug',
    value: function debug(boolean) {
      _logger2.default.active = boolean;
    }

    /**
     * Sets whether the canvas autoclears after each render
     * @param {boolean} boolean
     */

  }, {
    key: 'autoClear',
    value: function autoClear(boolean) {
      this._autoClear = boolean;
    }

    /**
     * Clears the canvas
     * @param {boolean} boolean
     */

  }, {
    key: 'clear',
    value: function clear() {
      if (this._type === Sandpit.CANVAS) {
        this._context.clearRect(0, 0, this.width(), this.height());
      } else if (this._type === Sandpit.WEGBL) {
        _logger2.default.warn('clear() is currently only supported in 2D');
      }
    }

    /**
     * Clear the query string
     */

  }, {
    key: 'clearQueryString',
    value: function clearQueryString() {
      window.history.replaceState({}, null, '/');
    }

    /**
     * Sets whether to or not to ignore the touch events for
     * multitouch, bypassing pinch to zoom, but meaning no
     * other touch events will work
     * @param {boolean} boolean
     */

  }, {
    key: 'focusTouchesOnCanvas',
    value: function focusTouchesOnCanvas() {
      this._focusTouchesOnCanvas = true;
    }

    /**
     * Returns the canvas context
     * @return {object} Context
     */

  }, {
    key: 'context',
    value: function context() {
      return this._context;
    }

    /**
     * Returns the canvas object
     * @return {canvas} Canvas
     */

  }, {
    key: 'canvas',
    value: function canvas() {
      return this._canvas;
    }

    /**
     * Returns the frame increment
     * @returns {number} Canvas width
     */

  }, {
    key: 'time',
    value: function time() {
      return this._time;
    }

    /**
     * Returns the canvas width
     * @returns {number} Canvas width
     */

  }, {
    key: 'width',
    value: function width() {
      return window.innerWidth;
    }

    /**
     * Returns the canvas height
     * @returns {number} Canvas height
     */

  }, {
    key: 'height',
    value: function height() {
      return window.innerHeight;
    }

    /**
     * Fills the canvas with the provided colour
     * @param {string} color - The color to fill with, in string format
     * (for example, '#000', 'rgba(0, 0, 0, 0.5)')
     */

  }, {
    key: 'fill',
    value: function fill(color) {
      if (this._type === Sandpit.CANVAS) {
        this._context.fillStyle = color;
        this._context.fillRect(0, 0, this.width(), this.height());
      } else if (this._type === Sandpit.WEGBL) {
        _logger2.default.warn('fill() is currently only supported in 2D');
      }
    }

    /**
     * Returns a promise using fetch
     * https://github.com/github/fetch
     * @param {string} url - The url to fetch
     */

  }, {
    key: 'get',
    value: function get(url) {
      return new Promise(function (resolve, reject) {
        fetch(url).then(function (response) {
          resolve(response.text());
        }).catch(function (error) {
          _logger2.default.info('Get fail', error);
          reject();
        });
      });
    }

    /**
     * Returns a random number generator based on a seed
     * @param {string} seed - The seed with which to create the random number
     * @returns {function} A function that returns a random number
     */

  }, {
    key: 'random',
    value: function random() {
      var seed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '123456';

      return (0, _seedrandom2.default)(seed);
    }

    /**
     * Resizes the canvas to the window width and height
     */

  }, {
    key: 'resizeCanvas',
    value: function resizeCanvas() {
      this._canvas.width = window.innerWidth;
      this._canvas.height = window.innerHeight;
    }

    /**
     * Sets up resizing and input events and starts the loop
     */

  }, {
    key: 'start',
    value: function start() {
      // Sets up settings
      if (this.defaults && Object.keys(this.defaults).length) this._setupSettings();
      // Sets up the events
      this._setupEvents();
      // Sets up setup
      if (this.setup) this.setup();
      // Loop!
      if (!this.loop) _logger2.default.warn('Looks like you need to define a loop');
      this._setupLoop();
    }

    /**
     * Stops the loop and removes event listeners
     */

  }, {
    key: 'stop',
    value: function stop() {
      var _this4 = this;

      // Delete element, if initiated
      if (this.canvas()) {
        this.canvas().outerHTML = '';
        delete this.canvas();
      }
      // Remove Gui, if initiated
      if (this._gui) {
        this._gui.domElement.removeEventListener('touchmove', this._preventDefault);
        this._gui.destroy();
      }
      // Stop the animation frame loop
      window.cancelAnimationFrame(this._animationFrame);
      // Remove all event listeners
      Object.keys(this._events).forEach(function (event) {
        if (_this4._events[event].disable) {
          _this4._events[event].disable.removeEventListener(event, _this4._preventDefault);
        }
        _this4._events[event].context.removeEventListener(event, _this4._events[event].event.bind(_this4));
      });
    }
  }]);

  return Sandpit;
}();

// TODO: Look at handling retina displays

exports.Is = _Is2.default;
exports.Mathematics = _Mathematics2.default;
exports.Color = _Color2.default;
exports.Vector = _Vector2.default;
exports.default = Sandpit;
