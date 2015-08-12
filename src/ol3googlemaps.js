goog.provide('olgm.OLGoogleMaps');

goog.require('goog.style');
goog.require('olgm.Abstract');



/**
 * @param {!olgmx.OLGoogleMapsOptions} options Options.
 * @constructor
 * @extends {olgm.Abstract}
 * @api
 */
olgm.OLGoogleMaps = function(options) {
  goog.base(this, options.ol3map, options.gmap);
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
  if (this.gmapIsActive_ === true) {
    return;
  }

  this.deactivateOpenLayers_();

  this.toggleGoogleMapsContainer_(true);

  var view = this.ol3map.getView();
  var zoom = view.getZoom();
  goog.asserts.assertNumber(zoom);
  var projection = view.getProjection();
  var center = view.getCenter();
  goog.asserts.assertArray(center);
  var centerLonLat = ol.proj.transform(center, projection, 'EPSG:4326');
  goog.asserts.assertArray(centerLonLat);
  var latLng = new google.maps.LatLng(centerLonLat[1], centerLonLat[0]);
  this.gmap.setZoom(zoom);
  this.gmap.setCenter(latLng);

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

  var view = this.ol3map.getView();
  var projection = view.getProjection();
  var latLng = this.gmap.getCenter();
  var center = ol.proj.transform(
      [latLng.lng(), latLng.lat()], 'EPSG:4326', projection);
  goog.asserts.assertArray(center);
  var zoom = this.gmap.getZoom();

  view.setCenter(center);
  view.setZoom(zoom);

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
