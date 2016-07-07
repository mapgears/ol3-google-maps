goog.provide('olgm.gm.MapMarker');


/**
 * Creates a new Map Marker
 * @constructor
 * @extends {google.maps.OverlayView}
 * @param {olx.style.IconOptions} imageStyle ol3 style properties
 * @param {Object.<string, *>=} opt_options Optional properties to set.
 * @api
 */
olgm.gm.MapMarker = function(imageStyle, opt_options) {
  this.set('zIndex', 1e3);
  this.setValues(opt_options);

  /**
   * This object contains the ol3 style properties for the marker. We keep
   * it as an object because its properties can change, for example the size
   * is only defined after the image is done loading.
   * @type {olx.style.IconOptions}
   * @private
   */
  this.imageStyle_ = imageStyle;
};
if (window.google && window.google.maps) {
  goog.inherits(olgm.gm.MapMarker, google.maps.OverlayView);
}


/**
 * @type {boolean}
 * @private
 */
olgm.gm.MapMarker.prototype.drawn_ = false;


/**
 * @type {number}
 * @private
 */
olgm.gm.MapMarker.prototype.height_ = 0;


/**
 * @type {number}
 * @private
 */
olgm.gm.MapMarker.prototype.width_ = 0;


/**
 * Listen to property changes and react accordingly
 * @param {string} prop property
 * @api
 */
olgm.gm.MapMarker.prototype.changed = function(prop) {
  switch (prop) {
    case 'maxZoom':
    case 'minZoom':
    case 'offsetX':
    case 'offsetY':
    case 'position':
      this.draw();
      break;
    default:
      break;
  }
};


/**
 * Draws the label to the canvas 2d context.
 * @private
 */
olgm.gm.MapMarker.prototype.drawCanvas_ = function() {
  var canvas = this.canvas_;
  if (!canvas) {
    return;
  }

  var image = this.imageStyle_.getImage();
  if (!image) {
    return;
  }

  var style = canvas.style;

  style.zIndex = /** @type {number} */ (this.get('zIndex'));

  var ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width, canvas.height);

  var anchor = this.imageStyle_.getAnchor();

  var offsetX = anchor[0];
  var offsetY = anchor[1];

  var x = canvas.width / 2 - offsetX;
  var y = canvas.height / 2 - offsetY;
  ctx.drawImage(image, x, y);
};


/**
 * Manage feature being added to the map
 * @api
 */
olgm.gm.MapMarker.prototype.onAdd = function() {
  var canvas = this.canvas_ = document.createElement('canvas');
  var style = canvas.style;
  style.position = 'absolute';

  this.drawCanvas_();

  var panes = this.getPanes();
  if (panes) {
    panes.markerLayer.appendChild(canvas);
  }
};


/**
 * Draw features to the map (call redraw) and setup canvas if it's the first
 * time we draw
 * @api
 */
olgm.gm.MapMarker.prototype.draw = function() {
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
olgm.gm.MapMarker.prototype.redraw_ = function() {
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
 * Get the visibility of the label.
 * @private
 * @return {string} blank string if visible, 'hidden' if invisible.
 */
olgm.gm.MapMarker.prototype.getVisible_ = function() {
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
 * Delete canvas when removing the marker
 * @api
 */
olgm.gm.MapMarker.prototype.onRemove = function() {
  var canvas = this.canvas_;
  if (canvas && canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }
};
