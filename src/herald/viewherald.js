goog.provide('olgm.herald.View');

goog.require('goog.asserts');
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
 * @api
 */
olgm.herald.View = function(ol3map, gmap) {
  goog.base(this, ol3map, gmap);
};
goog.inherits(olgm.herald.View, olgm.herald.Herald);


/**
 * @inheritDoc
 */
olgm.herald.View.prototype.activate = function() {
  goog.base(this, 'activate');

  var view = this.ol3map.getView();
  var keys = this.listenerKeys;
  keys.push(view.on('change:center', this.setCenter_, this));
  keys.push(view.on('change:resolution', this.setZoom_, this));

  this.setCenter_();
  this.setZoom_();

  // FIXME - handle browser resize as well...
};


/**
 * @private
 */
olgm.herald.View.prototype.setCenter_ = function() {
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
 * @private
 */
olgm.herald.View.prototype.setZoom_ = function() {
  var zoom = this.ol3map.getView().getZoom();
  if (goog.isNumber(zoom)) {
    this.gmap.setZoom(zoom);
  }
};
