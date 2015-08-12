goog.provide('olgm.OLGoogleMaps');

goog.require('goog.style');
goog.require('olgm.Abstract');
goog.require('olgm.FeatureHerald');
goog.require('olgm.ViewHerald');



/**
 * The main component of this library. It binds an OpenLayers map to a
 * GoogleMaps map and vice-versa.  It is responsible of creating the
 * sub-components that directly interact with both of the
 *
 * @param {!olgmx.OLGoogleMapsOptions} options Options.
 * @constructor
 * @extends {olgm.Abstract}
 * @api
 */
olgm.OLGoogleMaps = function(options) {

  /**
   * @type {Array.<olgm.Herald>}
   * @private
   */
  this.heralds_ = [];

  goog.base(this, options.ol3map, options.gmap);

  // create the heralds
  this.heralds_.push(new olgm.FeatureHerald(this.ol3map, this.gmap));
  this.heralds_.push(new olgm.ViewHerald(this.ol3map, this.gmap));

};
goog.inherits(olgm.OLGoogleMaps, olgm.Abstract);


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
  if (this.gmapIsActive_ === null) {
    this.activate_();
  }

  if (this.gmapIsActive_ === true) {
    return;
  }

  this.deactivateOpenLayers_();
  this.toggleGoogleMapsContainer_(true);
  this.switchMap_(olgm.MapType.GOOGLE_MAPS);
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
  this.switchMap_(olgm.MapType.OPENLAYERS);
  this.gmapIsActive_ = false;
};


/**
 * @api
 */
olgm.OLGoogleMaps.prototype.deactivate = function() {
  this.deactivate_();
  this.gmapIsActive_ = null;
  this.toggleGoogleMapsContainer_(true);
  this.toggleOpenLayersContainer_(true);
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
olgm.OLGoogleMaps.prototype.activate_ = function() {
  for (var i = 0, len = this.heralds_.length; i < len; i++) {
    this.heralds_[i].activate();
  }
};


/**
 * @private
 */
olgm.OLGoogleMaps.prototype.deactivate_ = function() {
  for (var i = 0, len = this.heralds_.length; i < len; i++) {
    this.heralds_[i].deactivate();
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
 * @param {string} mapType
 * @private
 */
olgm.OLGoogleMaps.prototype.switchMap_ = function(mapType) {
  for (var i = 0, len = this.heralds_.length; i < len; i++) {
    this.heralds_[i].switchMap(mapType);
  }
};


/**
 * @param {boolean} show
 * @private
 */
olgm.OLGoogleMaps.prototype.toggleGoogleMapsContainer_ = function(show) {
  var div = /** @type {Element} */ (this.gmap.getDiv());
  goog.style.setElementShown(div, show);
};


/**
 * @param {boolean} show
 * @private
 */
olgm.OLGoogleMaps.prototype.toggleOpenLayersContainer_ = function(show) {
  var parent = goog.dom.getParentElement(this.ol3map.getViewport());
  goog.asserts.assertInstanceof(parent, Element);
  goog.style.setElementShown(parent, show);
};
