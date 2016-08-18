goog.provide('olgm.gm.MapElement');

/** @suppress {extraRequire} */
goog.require('ol.has');


/**
 * This class is a parent for all elements that are drawn manually onto Google
 * Maps. This means drawing elements on a canvas attached to the Google Maps
 * map instead of drawing features on map tiles using their API.
 * This needs to be done for elements that are supported in OpenLayers 3 but
 * not in Google Maps, such as text labels on markers.
 *
 * Some of this code was borrowed from the MapLabel project, whose source code
 * can be found here: https://github.com/googlemaps/js-map-label
 */

/**
 * Creates a new Map Element, to be drawn as an OverlayView
 * @constructor
 * @extends {google.maps.OverlayView}
 * @api
 */
olgm.gm.MapElement = function() {

};
if (window.google && window.google.maps) {
  ol.inherits(olgm.gm.MapElement, google.maps.OverlayView);
}


/**
 * @type {boolean}
 * @private
 */
olgm.gm.MapElement.prototype.drawn_ = false;


/**
 * @type {number}
 * @private
 */
olgm.gm.MapElement.prototype.height_ = 0;


/**
 * @type {number}
 * @private
 */
olgm.gm.MapElement.prototype.width_ = 0;


/**
 * Draw features to the map (call redraw) and setup canvas if it's the first
 * time we draw
 * @api
 */
olgm.gm.MapElement.prototype.draw = function() {
  if (this.drawn_) {
    this.redraw_();
    return;
  }

  var canvas = this.canvas_;
  if (!canvas) {
    // onAdd has not been called yet.
    return;
  }

  var ctx = canvas.getContext('2d');
  var height = ctx.canvas.height;
  var width = ctx.canvas.width;
  this.width_ = width;
  this.height_ = height;

  if (!this.redraw_()) {
    return;
  }

  this.drawn_ = true;
};


/**
 * Redraw features to the map
 * @return {boolean} whether or not the function ran successfully
 * @private
 */
olgm.gm.MapElement.prototype.redraw_ = function() {
  var latLng = /** @type {google.maps.LatLng} */ (this.get('position'));
  if (!latLng) {
    return false;
  }

  var projection = this.getProjection();
  if (!projection) {
    // The map projection is not ready yet so do nothing
    return false;
  }

  var pos = projection.fromLatLngToDivPixel(latLng);
  var height = this.height_;
  var width = this.width_;

  var offsetX = this.get('offsetX') || 0;
  var offsetY = this.get('offsetY') || 0;

  var style = this.canvas_.style;
  style['top'] = (pos.y - (height / 2) + offsetY) + 'px';
  style['left'] = (pos.x - (width / 2) + offsetX) + 'px';

  style['visibility'] = this.getVisible_();

  return true;
};


/**
 * Get the visibility of the element.
 * @private
 * @return {string} blank string if visible, 'hidden' if invisible.
 */
olgm.gm.MapElement.prototype.getVisible_ = function() {
  var minZoom = /** @type {number} */ (this.get('minZoom'));
  var maxZoom = /** @type {number} */ (this.get('maxZoom'));

  if (minZoom === undefined && maxZoom === undefined) {
    return '';
  }

  var map = this.getMap();
  if (!map) {
    return '';
  }

  var mapZoom = map.getZoom();
  if (mapZoom < minZoom || mapZoom > maxZoom) {
    return 'hidden';
  }
  return '';
};


/**
 * Delete canvas when removing the element
 * @api
 */
olgm.gm.MapElement.prototype.onRemove = function() {
  var canvas = this.canvas_;
  if (canvas && canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }
};
