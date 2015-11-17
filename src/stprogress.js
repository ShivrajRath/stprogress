/* stProgress, (c) 2015 Shivraj Rath - http://novicelab.org/stprogress
 * A light-weighted slim top progress bar to indicate service calls happening from your app.
 * @license MIT
 */
;(function (XHR) {

  'use strict';

  /** Used to determine if values are of the language type `Object`. */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Detect free variable `exports`. */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = freeExports && freeModule && typeof global === 'object' && global && global.Object && global;

  /** Detect free variable `self`. */
  var freeSelf = objectTypes[typeof self] && self && self.Object && self;

  /** Detect free variable `window`. */
  var freeWindow = objectTypes[typeof window] && window && window.Object && window;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /**
   * Used as a reference to the global object.
   *
   * The `this` value is used if it's the global object to avoid Greasemonkey's
   * restricted `window` object, otherwise the `window` object is used.
   */
  var root = freeGlobal || ((freeWindow !== (this && this.window)) && freeWindow) || freeSelf || this;

  /**
   * Runs the code in context of environment (browser or node)
   * @return {undefined}
   */
  function runInContext() {
    var
      delay = 500,
      activeXHRs = 0,
      progressing = false,
      // Progress bar div
      progressDiv = document.getElementById('progress');

    /**
     * Set's progress bar's width
     * @param {Number} width Width
     */
    function setProgressWidth(width) {
      progressDiv.style.width = width + '%';
    }

    /**
     * Recursively progress the bar with regular increments
     * @param {Number} progressed progress percentage
     */
    function progress(progressed) {
      window.setTimeout(function () {

        // Remaining percentage of progress
        var remaining = 100 - progressed;

        // If progress bar count exceeds 99, stop the progress; the page is super slow
        if (progressed > 99 || !progressing) {
          completeProgress();
          return;
        }

        // Calculate the next progress width
        progressed = progressed + (0.15 * Math.pow(1 - Math.sqrt(remaining), 2));

        // Set the progress bar width
        setProgressWidth(progressed);

        // Progress with next count
        progress(progressed);

        // Increments after every half a second
      }, delay);
    }

    /**
     * Starts the progress bar and increments activeXHRs
     * @return {undefined}
     */
    function startProgress() {
      // If not started already
      if (!progressing) {

        // Reset activeXHRs
        activeXHRs = 0;

        progressing = true;
        // Set progress div display block
        progressDiv.style.display = 'block';
        // Start the progress
        progress(0);
      }

      activeXHRs++;
    }

    /**
     * Decrements the active XHR requests and completes the progress if none exists
     * @return {undefined}
     */
    function completeProgress() {

      activeXHRs--;

      if (activeXHRs < 1) {
        // Wait for a second to verify a new request has not been triggered
        window.setTimeout(function () {
          if (activeXHRs < 1) {
            progressing = false;
            setProgressWidth(101);
            window.setTimeout(function () {
              progressDiv.style.display = 'none';
              setProgressWidth(0);
              // After half a second stop the progress
            }, delay);
          }
        }, delay * 2);
      }
    }

    // Override XHR open and send
    var open = XHR.prototype.open;
    var send = XHR.prototype.send;

    /**
     * XHR.open override
     */
    XHR.prototype.open = function (method, url, async, user, pass) {
      startProgress();
      open.call(this, method, url, async, user, pass);
    };

    /**
     * XHR.send override
     */
    XHR.prototype.send = function (data) {
      var self = this;

      function onReadyStateChange() {
        if (self.readyState === 4) {
          completeProgress();
          // Remove event listner; prevents memory leaks
          self.removeEventListener('readystatechange', onReadyStateChange, false);
        }
      }
      // Adds readystatechange event listner
      this.addEventListener('readystatechange', onReadyStateChange, false);
      send.call(this, data);
    };
  }

  // Export progressbar
  var stProgress = runInContext();

  if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
    // Expose lodash to the global object when an AMD loader is present to avoid
    // errors in cases where lodash is loaded by a script tag and not intended
    // as an AMD module. See http://requirejs.org/docs/errors.html#mismatch for
    // more details.
    root.stProgress = stProgress;

    define(function () {
      return stProgress;
    });
  }
  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
  else if (freeExports && freeModule) {
    // Export for Node.js or RingoJS.
    if (moduleExports) {
      freeModule.exports = stProgress;
    }
    // Export for Rhino with CommonJS support.
    else {
      freeExports.stProgress = stProgress;
    }
  } else {
    // Export for a browser or Rhino.
    root.stProgress = stProgress;
  }
}).call(this, XMLHttpRequest);
