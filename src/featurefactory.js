goog.provide('olgm.FeatureFactory');

goog.require('goog.asserts');
//goog.require('ol.geom.Point');
//goog.require('ol.proj');
goog.require('olgm.Abstract');



/**
 * The factory responsible of creating any type of features, i.e. OpenLayers
 * and GoogleMaps ones.
 *
 * @constructor
 * @param {!ol.Map} ol3map
 * @param {!google.maps.Map} gmap
 * @extends {olgm.Abstract}
 * @api
 */
olgm.FeatureFactory = function(ol3map, gmap) {

  /**
   * @type {ol.proj.Projection}
   * @private
   */
  this.ol3Proj_ = ol3map.getView().getProjection();

  goog.base(this, ol3map, gmap);
};
goog.inherits(olgm.FeatureFactory, olgm.Abstract);


/**
 * Create a Google Maps feature using an OpenLayers one.
 * @param {ol.Feature} feature
 * @return {google.maps.Data.Feature}
 * @api
 */
olgm.FeatureFactory.prototype.createGoogleMapsFeature = function(feature) {

  // FIXME - hardcoded, only points are currently supported
  var geometry = feature.getGeometry();
  goog.asserts.assertInstanceof(geometry, ol.geom.Point);
  var coordinates = geometry.getCoordinates();
  var lonLatCoords = ol.proj.transform(coordinates, this.ol3Proj_, 'EPSG:4326');

  return new google.maps.Data.Feature({
    geometry: new google.maps.LatLng(lonLatCoords[1], lonLatCoords[0])
  });
};
