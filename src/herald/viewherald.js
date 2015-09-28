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
olgm.herald.View.prototype.switchMap = function(mapType) {

  goog.base(this, 'switchMap', mapType);

  var center;
  var latLng;
  var view = this.ol3map.getView();
  var projection = view.getProjection();
  var zoom;

  if (mapType === olgm.MapType.GOOGLE_MAPS) {
    zoom = view.getZoom();
    goog.asserts.assertNumber(zoom);
    center = view.getCenter();
    goog.asserts.assertArray(center);
    var centerLonLat = ol.proj.transform(center, projection, 'EPSG:4326');
    goog.asserts.assertArray(centerLonLat);
    latLng = new google.maps.LatLng(centerLonLat[1], centerLonLat[0]);
    this.gmap.setZoom(zoom);
    this.gmap.setCenter(latLng);
  } else if (mapType === olgm.MapType.OPENLAYERS) {
    latLng = this.gmap.getCenter();
    center = ol.proj.transform(
        [latLng.lng(), latLng.lat()], 'EPSG:4326', projection);
    goog.asserts.assertArray(center);
    zoom = this.gmap.getZoom();
    view.setCenter(center);
    view.setZoom(zoom);
  }
};
