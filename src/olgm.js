goog.provide('olgm');

goog.require('goog.events');


/**
 * @param {string|Array.<number>} color
 * @return {?number}
 */
olgm.getColorOpacity = function(color) {

  var opacity = null;
  var rgba = null;

  if (typeof color === 'string') {
    // is string
    if (olgm.stringStartsWith(color, 'rgba')) {
      rgba = olgm.parseRGBA(color);
    }
  } else {
    // is array
    rgba = color;
  }

  if (rgba && rgba[3] !== undefined) {
    opacity = +rgba[3];
  }

  return opacity;
};


/**
 * Source: http://stackoverflow.com/questions/7543818/\
 *     regex-javascript-to-match-both-rgb-and-rgba
 * @param {string} rgbaString
 * @return {?Array.<number>}
 */
olgm.parseRGBA = function(rgbaString) {
  var rgba = null;
  var regex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/;
  var matches = rgbaString.match(regex);
  if (matches && matches.length) {
    rgba = [
      +matches[1],
      +matches[2],
      +matches[3],
      +matches[4]
    ];
  }
  return rgba;
};


/**
 * @param {string} string
 * @param {string} needle
 * @return {boolean}
 */
olgm.stringStartsWith = function(string, needle) {
  return (string.indexOf(needle) === 0);
};


/**
 * @param {Array.<goog.events.Key>} listenerKeys
 */
olgm.unlistenAllByKey = function(listenerKeys) {
  listenerKeys.forEach(ol.Observable.unByKey);
  listenerKeys.length = 0;
};
