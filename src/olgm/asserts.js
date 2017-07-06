/* Based on https://github.com/openlayers/openlayers/blob/master/src/ol/asserts.js */
goog.provide('olgm.asserts');


/**
 * @param {*} assertion Assertion we expected to be truthy
 * @param {string=} opt_message Error message in case of failure
 */
olgm.asserts.assert = function(assertion, opt_message) {
  if (!assertion) {
    var message = 'Assertion failed';
    if (opt_message) {
      message += ': ' + opt_message;
    }
    throw new Error(message);
  }
};
