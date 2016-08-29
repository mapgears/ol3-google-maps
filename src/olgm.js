goog.provide('olgm');


/**
 * @type {!Array.<number>}
 */
olgm.RESOLUTIONS = [
  156543.03390625,
  78271.516953125,
  39135.7584765625,
  19567.87923828125,
  9783.939619140625,
  4891.9698095703125,
  2445.9849047851562,
  1222.9924523925781,
  611.4962261962891,
  305.74811309814453,
  152.87405654907226,
  76.43702827453613,
  38.218514137268066,
  19.109257068634033,
  9.554628534317017,
  4.777314267158508,
  2.388657133579254,
  1.194328566789627,
  0.5971642833948135,
  0.298582141697,
  0.14929107084,
  0.07464553542,
  0.03732276771
];


/**
 * @param {ol.geom.Geometry} geometry the geometry to get the center of
 * @return {ol.Coordinate} the center coordinates
 */
olgm.getCenterOf = function(geometry) {

  var center = null;

  if (geometry instanceof ol.geom.Point) {
    center = geometry.getCoordinates();
  } else if (geometry instanceof ol.geom.Polygon) {
    center = geometry.getInteriorPoint().getCoordinates();
  } else {
    center = ol.extent.getCenter(geometry.getExtent());
  }

  return center;
};


/**
 * @param {ol.Color|ol.ColorLike} color the color
 * to parse
 * @return {string} the parsed color
 */
olgm.getColor = function(color) {

  var out = '';
  var rgba = null;

  if (typeof color === 'string') {
    // is string
    if (olgm.stringStartsWith(color, 'rgba')) {
      rgba = olgm.parseRGBA(color);
    } else {
      out = color;
    }
  } else if (Array.isArray(color)) {
    rgba = color;
  }

  if (rgba !== null) {
    out = ['rgb(', rgba[0], ',', rgba[1], ',', rgba[2], ')'].join('');
  }

  return out;
};


/**
 * @param {ol.Color|ol.ColorLike} color the color
 * to check
 * @return {?number} the color's opacity
 */
olgm.getColorOpacity = function(color) {

  var opacity = null;
  var rgba = null;

  if (typeof color === 'string') {
    // is string
    if (olgm.stringStartsWith(color, 'rgba')) {
      rgba = olgm.parseRGBA(color);
    }
  } else if (Array.isArray(color)) {
    rgba = color;
  }

  if (rgba && rgba[3] !== undefined) {
    opacity = +rgba[3];
  }

  return opacity;
};


/**
 * Get the style from the specified object.
 * @param {ol.style.Style|ol.StyleFunction|ol.layer.Vector|ol.Feature}
 object object from which we get the style
 * @return {?ol.style.Style} the style of the object
 */
olgm.getStyleOf = function(object) {

  var style = null;

  if (object instanceof ol.style.Style) {
    style = object;
  } else if (object instanceof ol.layer.Vector ||
             object instanceof ol.Feature) {
    style = object.getStyle();
    if (style && style instanceof Function) {
      style = style()[0]; // todo - support multiple styles ?
    }
  } else if (object instanceof Function) {
    style = object()[0]; // todo - support multiple styles ?
  }

  return style;
};


/**
 * @param {number} resolution the resolution to get the zoom from
 * @return {?number} the zoom from the resolution, if found
 */
olgm.getZoomFromResolution = function(resolution) {

  var found = null;
  var precision = 1000;
  var res = Math.round(resolution * precision) / precision;

  for (var z = 0, len = olgm.RESOLUTIONS.length; z < len; z++) {
    if (res == Math.round(olgm.RESOLUTIONS[z] * precision) / precision) {
      found = z;
      break;
    }
  }

  return found;
};


/**
 * Source: http://stackoverflow.com/questions/7543818/\
 *     regex-javascript-to-match-both-rgb-and-rgba
 * @param {string} rgbaString the rgbaString to parse
 * @return {?Array.<number>} the rgba color in number array format
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
 * @param {string} string string to check
 * @param {string} needle string to find
 * @return {boolean} whether or not the needle was found in the string
 */
olgm.stringStartsWith = function(string, needle) {
  return (string.indexOf(needle) === 0);
};


/**
 * @param {Array.<ol.EventsKey|Array.<ol.EventsKey>>} listenerKeys listener
 * keys
 * @param {Array.<goog.events.Key>=} opt_googListenerKeys closure listener keys
 */
olgm.unlistenAllByKey = function(listenerKeys, opt_googListenerKeys) {
  listenerKeys.forEach(ol.Observable.unByKey);
  listenerKeys.length = 0;
  if (opt_googListenerKeys) {
    opt_googListenerKeys.forEach(goog.events.unlistenByKey);
    opt_googListenerKeys.length = 0;
  }
};
