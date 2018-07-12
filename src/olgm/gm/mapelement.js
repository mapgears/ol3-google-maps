import {inherits} from 'ol/index.js';

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
const MapElement = function() {

};
if (window.google && window.google.maps) {
  inherits(MapElement, google.maps.OverlayView);
}

/**
 * @type {boolean}
 * @private
 */
MapElement.prototype.drawn_ = false;


/**
 * @type {number}
 * @private
 */
MapElement.prototype.height_ = 0;


/**
 * @type {number}
 * @private
 */
MapElement.prototype.width_ = 0;


/**
 * Draw features to the map (call redraw) and setup canvas if it's the first
 * time we draw
 * @api
 * @override
 */
MapElement.prototype.draw = function() {
  if (this.drawn_) {
    this.redraw_();
    return;
  }

  const canvas = this.canvas_;
  if (!canvas) {
    // onAdd has not been called yet.
    return;
  }

  const ctx = canvas.getContext('2d');
  const height = ctx.canvas.height;
  const width = ctx.canvas.width;
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
MapElement.prototype.redraw_ = function() {
  const latLng = /** @type {google.maps.LatLng} */ (this.get('position'));
  if (!latLng) {
    return false;
  }

  const projection = this.getProjection();
  if (!projection) {
    // The map projection is not ready yet so do nothing
    return false;
  }

  const pos = projection.fromLatLngToDivPixel(latLng);
  const height = this.height_;
  const width = this.width_;

  const offsetX = this.get('offsetX') || 0;
  const offsetY = this.get('offsetY') || 0;

  const style = this.canvas_.style;
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
MapElement.prototype.getVisible_ = function() {
  const minZoom = /** @type {number} */ (this.get('minZoom'));
  const maxZoom = /** @type {number} */ (this.get('maxZoom'));

  if (minZoom === undefined && maxZoom === undefined) {
    return '';
  }

  const map = this.getMap();
  if (!map) {
    return '';
  }

  const mapZoom = map.getZoom();
  if (mapZoom < minZoom || mapZoom > maxZoom) {
    return 'hidden';
  }
  return '';
};


/**
 * Delete canvas when removing the element
 * @api
 * @override
 */
MapElement.prototype.onRemove = function() {
  const canvas = this.canvas_;
  if (canvas && canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }
};
export default MapElement;
