/**
 * @module olgm/gm/MapElement
 */
/**
 * @classdesc
 * This class is a parent for all elements that are drawn manually onto Google
 * Maps. This means drawing elements on a canvas attached to the Google Maps
 * map instead of drawing features on map tiles using their API.
 * This needs to be done for elements that are supported in OpenLayers 3 but
 * not in Google Maps, such as text labels on markers.
 *
 * Some of this code was borrowed from the MapLabel project, whose source code
 * can be found here: https://github.com/googlemaps/js-map-label
 * @api
 */
class MapElement extends ((window.google && window.google.maps && google.maps.OverlayView) || Object) {
  /**
   * Creates a new Map Element, to be drawn as an OverlayView
   */
  constructor() {
    super();

    /**
     * @type {boolean}
     * @private
     */
    this.drawn_ = false;


    /**
     * @type {number}
     * @private
     */
    this.height_ = 0;


    /**
     * @type {number}
     * @private
     */
    this.width_ = 0;
  }


  /**
   * Draw features to the map (call redraw) and setup canvas if it's the first
   * time we draw
   * @api
   * @override
   */
  draw() {
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
  }


  /**
   * Redraw features to the map
   * @return {boolean} whether or not the function ran successfully
   * @private
   */
  redraw_() {
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
  }


  /**
   * Get the visibility of the element.
   * @private
   * @return {string} blank string if visible, 'hidden' if invisible.
   */
  getVisible_() {
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
  }


  /**
   * Delete canvas when removing the element
   * @api
   * @override
   */
  onRemove() {
    const canvas = this.canvas_;
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  }
}
export default MapElement;
