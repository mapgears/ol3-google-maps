goog.provide('olgm.FeatureFactory');

goog.require('goog.asserts');
//goog.require('ol.geom.Point');
//goog.require('ol.proj');



/**
 * The factory responsible of creating any type of features, i.e. OpenLayers
 * and GoogleMaps ones.
 *
 * @constructor
 * @api
 */
olgm.FeatureFactory = function() {};


/**
 * Create a Google Maps feature using an OpenLayers one.
 * @param {ol.Feature} feature
 * @param {ol.Map=} opt_ol3map For reprojection purpose. If undefined, then
 *     `EPSG:3857` is used.
 * @return {google.maps.Data.Feature}
 * @api
 */
olgm.FeatureFactory.prototype.createGoogleMapsFeature = function(
    feature, opt_ol3map) {

  var inProj = (opt_ol3map !== undefined) ?
      opt_ol3map.getView().getProjection() : 'EPSG:3857';

  // FIXME - hardcoded, only points are currently supported
  var geometry = feature.getGeometry();
  goog.asserts.assertInstanceof(geometry, ol.geom.Point);
  var coordinates = geometry.getCoordinates();
  var lonLatCoords = ol.proj.transform(coordinates, inProj, 'EPSG:4326');

  return new google.maps.Data.Feature({
    geometry: new google.maps.LatLng(lonLatCoords[1], lonLatCoords[0])
  });
};
