goog.provide('olgm.gm.ImageOverlay');



/**
 * Creates a new image overlay.
 * @constructor
 * @extends {google.maps.OverlayView}
 * @param {string} src url to the image
 * @param {Array.<number>} size size of the image
 * @param {google.maps.LatLng} topLeft topLeft corner
 * @api
 */
olgm.gm.ImageOverlay = function(src, size, topLeft) {
  /**
   * @type {string}
   * @private
   */
  olgm.gm.ImageOverlay.prototype.src_ = src;

  /**
   * @type {Array.<number>}
   * @private
   */
  olgm.gm.ImageOverlay.prototype.size_ = size;

  /**
   * @type {google.maps.LatLng}
   * @private
   */
  olgm.gm.ImageOverlay.prototype.topLeft_ = topLeft;

  /**
   * @type {Element}
   * @private
   */
  olgm.gm.ImageOverlay.prototype.div_ = null;
};
if (window.google && window.google.maps) {
  goog.inherits(olgm.gm.ImageOverlay, google.maps.OverlayView);
}


/**
 * Note: mark as `@api` to make the minimized version include this method.
 * @api
 */
olgm.gm.ImageOverlay.prototype.onAdd = function() {
  var div = document.createElement('div');
  div.style.borderStyle = 'none';
  div.style.borderWidth = '0px';
  div.style.position = 'absolute';

  // Create the img element and attach it to the div.
  var img = document.createElement('img');
  img.src = this.src_;
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.position = 'absolute';
  div.appendChild(img);

  this.div_ = div;

  // Add the element to the "overlayLayer" pane.
  var panes = this.getPanes();
  panes.overlayLayer.appendChild(div);
};


/**
 * Note: mark as `@api` to make the minimized version include this method.
 * @api
 */
olgm.gm.ImageOverlay.prototype.draw = function() {
  var div = this.div_;

  var sizeX = this.size_[0];
  var sizeY = this.size_[1];

  div.style.width = sizeX + 'px';
  div.style.height = sizeY + 'px';

  var overlayProjection = this.getProjection();
  var topLeftPx = overlayProjection.fromLatLngToDivPixel(this.topLeft_);

  var offsetX = topLeftPx.x;
  var offsetY = topLeftPx.y;

  // Adjust bad calculations when the view is larger than the world
  var worldWidth = overlayProjection.getWorldWidth();
  if (worldWidth < sizeX) {
    // Overlap of the map on each size
    var mapOverlap = Math.floor(sizeX / worldWidth) / 2;

    // For when only one map is overlapping
    var factor = Math.max(mapOverlap, 1);

    offsetX -= worldWidth * factor;
  }

  div.style.top = offsetY + 'px';
  div.style.left = offsetX + 'px';
};


/**
 * Note: mark as `@api` to make the minimized version include this method.
 * @api
 */
olgm.gm.ImageOverlay.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
};
