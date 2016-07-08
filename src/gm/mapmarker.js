goog.provide('olgm.gm.MapMarker');

goog.require('olgm.gm.MapElement');


/**
 * Creates a new Map Marker
 * @constructor
 * @extends {olgm.gm.MapElement}
 * @param {olx.style.IconOptions} imageStyle ol3 style properties
 * @param {Object.<string, *>=} opt_options Optional properties to set.
 * @api
 */
olgm.gm.MapMarker = function(imageStyle, opt_options) {
  goog.base(this);

  /**
   * This object contains the ol3 style properties for the marker. We keep
   * it as an object because its properties can change, for example the size
   * is only defined after the image is done loading.
   * @type {olx.style.IconOptions}
   * @private
   */
  this.imageStyle_ = imageStyle;

  this.setValues(opt_options);
};
goog.inherits(olgm.gm.MapMarker, olgm.gm.MapElement);


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
 * Draws the marker to the canvas 2d context.
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
