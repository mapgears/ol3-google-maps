goog.provide('olgm.herald.View');

goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.EventType');
//goog.require('ol.proj');
goog.require('olgm.herald.Herald');



/**
 * The View Herald is responsible of synchronizing the view (center/zoom)
 * of boths maps.
 *
 * It is manually done in the `switchMap` method.
 *
 * @param {!ol.Map} ol3map
 * @param {!google.maps.Map} gmap
 * @constructor
 * @extends {olgm.herald.Herald}
 */
olgm.herald.View = function(ol3map, gmap) {
  goog.base(this, ol3map, gmap);
};
goog.inherits(olgm.herald.View, olgm.herald.Herald);


/**
 * On window resize, the GoogleMaps map gets recentered. To avoid doing this
 * too often, a timeout is set.
 * @type {?number}
 * @private
 */
olgm.herald.View.prototype.windowResizeTimerId_ = null;


/**
 * @inheritDoc
 */
olgm.herald.View.prototype.activate = function() {
  goog.base(this, 'activate');

  var view = this.ol3map.getView();
  var keys = this.listenerKeys;

  // listen to center change
  keys.push(view.on('change:center', this.setCenter, this));

  // listen to resolution change
  keys.push(view.on('change:resolution', this.setZoom, this));

  // listen to browser window resize
  keys.push(goog.events.listen(
      window,
      goog.events.EventType.RESIZE,
      this.handleWindowResize_,
      false,
      this));

  this.setCenter();
  this.setZoom();
};


/**
 * @inheritDoc
 */
olgm.herald.View.prototype.deactivate = function() {
  goog.base(this, 'deactivate');
};


/**
 * Recenter the gmap map at the ol3 map center location.
 */
olgm.herald.View.prototype.setCenter = function() {
  var view = this.ol3map.getView();
  var projection = view.getProjection();
  var center = view.getCenter();
  if (goog.isArray(center)) {
    center = ol.proj.transform(center, projection, 'EPSG:4326');
    goog.asserts.assertArray(center);
    this.gmap.setCenter(new google.maps.LatLng(center[1], center[0]));
  }
};


/**
 * Set the gmap map zoom level at the ol3 map view zoom level.
 */
olgm.herald.View.prototype.setZoom = function() {
  var zoom = this.ol3map.getView().getZoom();
  if (goog.isNumber(zoom)) {
    this.gmap.setZoom(zoom);
  }
};


/**
 * Called when the browser window is resized. Set the center of the GoogleMaps
 * map after a slight delay.
 * @private
 */
olgm.herald.View.prototype.handleWindowResize_ = function() {
  if (!goog.isNull(this.windowResizeTimerId_)) {
    goog.global.clearTimeout(this.windowResizeTimerId_);
  }
  this.windowResizeTimerId_ = window.setTimeout(
      goog.bind(this.setCenterAfterResize_, this),
      100);
};


/**
 * Called after the browser window got resized, after a small delay.
 * Set the center of the GoogleMaps map and reset the timeout.
 * @private
 */
olgm.herald.View.prototype.setCenterAfterResize_ = function() {
  this.setCenter();
  this.windowResizeTimerId_ = null;
};
