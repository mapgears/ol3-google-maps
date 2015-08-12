goog.provide('olgm.OLGoogleMaps');

goog.require('goog.style');



/**
 * @param {!olgmx.OLGoogleMapsOptions} options Options.
 * @constructor
 * @api
 */
olgm.OLGoogleMaps = function(options) {

  /**
   * @type {!ol.Map}
   * @private
   */
  this.ol3map_ = options.ol3map;

  /**
   * @type {!google.maps.Map}
   * @private
   */
  this.gmap_ = options.gmap;

};


/**
 * Flag used to determine which map is currently active:
 *  - GoogleMaps: `true`
 *  - OpenLayers: `false`
 *  - None: `null` (upon initialization only)
 * @type {?boolean}
 * @private
 */
olgm.OLGoogleMaps.prototype.gmapIsActive_ = null;


/**
 * @api
 */
olgm.OLGoogleMaps.prototype.activateGoogleMaps = function() {
  if (this.gmapIsActive_ === true) {
    return;
  }

  this.deactivateOpenLayers_();

  this.toggleGoogleMapsContainer_(true);

  this.gmapIsActive_ = true;
};


/**
 * @api
 */
olgm.OLGoogleMaps.prototype.activateOpenLayers = function() {
  if (this.gmapIsActive_ === false) {
    return;
  }

  this.deactivateGoogleMaps_();

  this.toggleOpenLayersContainer_(true);

  this.gmapIsActive_ = false;
};


/**
 * @api
 */
olgm.OLGoogleMaps.prototype.toggle = function() {
  if (this.gmapIsActive_ === false || goog.isNull(this.gmapIsActive_)) {
    this.activateGoogleMaps();
  } else {
    this.activateOpenLayers();
  }
};


/**
 * @private
 */
olgm.OLGoogleMaps.prototype.deactivateGoogleMaps_ = function() {
  this.toggleGoogleMapsContainer_(false);
};


/**
 * @private
 */
olgm.OLGoogleMaps.prototype.deactivateOpenLayers_ = function() {
  this.toggleOpenLayersContainer_(false);
};


/**
 * @param {boolean} show
 * @private
 */
olgm.OLGoogleMaps.prototype.toggleGoogleMapsContainer_ = function(show) {
  var div = /** @type {Element} */ (this.gmap_.getDiv());
  goog.style.setElementShown(div, show);
};


/**
 * @param {boolean} show
 * @private
 */
olgm.OLGoogleMaps.prototype.toggleOpenLayersContainer_ = function(show) {
  var parent = goog.dom.getParentElement(this.ol3map_.getViewport());
  goog.asserts.assertInstanceof(parent, Element);
  goog.style.setElementShown(parent, show);
};
