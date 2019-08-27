/**
 * @module olgm/util
 */
import Feature from 'ol/Feature.js';
import {getCenter} from 'ol/extent.js';
import Point from 'ol/geom/Point.js';
import Polygon from 'ol/geom/Polygon.js';
import Vector from 'ol/layer/Vector.js';
import Style from 'ol/style/Style.js';

/**
 * @type {!Array<number>}
 */
export const RESOLUTIONS = [
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
 * @param {module:ol/geom/Geometry} geometry the geometry to get the center of
 * @return {module:ol/coordinate~Coordinate} the center coordinates
 */
export function getCenterOf(geometry) {

  let center = null;

  if (geometry instanceof Point) {
    center = geometry.getCoordinates();
  } else if (geometry instanceof Polygon) {
    center = geometry.getInteriorPoint().getCoordinates();
  } else {
    center = getCenter(geometry.getExtent());
  }

  return center;
}


/**
 * @param {module:ol/color~Color|module:ol/color~ColorLike} color the color
 * to parse
 * @return {string} the parsed color
 */
export function getColor(color) {

  let out = '';
  let rgba = null;

  if (typeof color === 'string') {
    // is string
    if (stringStartsWith(color, 'rgba')) {
      rgba = parseRGBA(color);
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
}


/**
 * @param {module:ol/color~Color|module:ol/color~ColorLike} color the color
 * to check
 * @return {?number} the color's opacity
 */
export function getColorOpacity(color) {

  let opacity = null;
  let rgba = null;

  if (typeof color === 'string') {
    // is string
    if (stringStartsWith(color, 'rgba')) {
      rgba = parseRGBA(color);
    }
  } else if (Array.isArray(color)) {
    rgba = color;
  }

  if (rgba && rgba[3] !== undefined) {
    opacity = +rgba[3];
  }

  return opacity;
}


/**
 * Get the style from the specified object.
 * @param {module:ol/style/Style|module:ol/style/Style~StyleFunction|module:ol/layer/Vector|module:ol/Feature}
 object object from which we get the style
 * @return {?module:ol/style/Style} the style of the object
 */
export function getStyleOf(object) {

  let style = null;

  if (object instanceof Style) {
    style = object;
  } else if (object instanceof Vector ||
             object instanceof Feature) {
    style = object.getStyle();
    if (style && style instanceof Function) {
      style = style()[0]; // todo - support multiple styles ?
    }
  } else if (object instanceof Function) {
    style = object()[0]; // todo - support multiple styles ?
  }

  return style;
}


/**
 * @param {number} resolution the resolution to get the zoom from
 * @param {number} minZoom the minimum zoom value (normally 0)
 * @return {number} the zoom from the resolution, which can be fractional
 */
export function getZoomFromResolution(resolution, minZoom) {
  minZoom = minZoom || 0;
  return minZoom + Math.log(RESOLUTIONS[0] / resolution) / Math.log(2);
}


/**
 * Source: http://stackoverflow.com/questions/7543818/\
 *     regex-javascript-to-match-both-rgb-and-rgba
 * @param {string} rgbaString the rgbaString to parse
 * @return {?Array<number>} the rgba color in number array format
 */
export function parseRGBA(rgbaString) {
  let rgba = null;
  const regex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/;
  const matches = rgbaString.match(regex);
  if (matches && matches.length) {
    rgba = [
      +matches[1],
      +matches[2],
      +matches[3],
      +matches[4]
    ];
  }
  return rgba;
}


/**
 * @param {string} string string to check
 * @param {string} needle string to find
 * @return {boolean} whether or not the needle was found in the string
 */
export function stringStartsWith(string, needle) {
  return (string.indexOf(needle) === 0);
}

/**
 * OL-Google-Maps version.
 * @type {string}
 */
export const VERSION = '0.21.0';
