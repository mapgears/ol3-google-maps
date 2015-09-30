goog.provide('olgm');

goog.require('goog.asserts');
goog.require('goog.events');


/**
 * @param {Array.<goog.events.Key>} listenerKeys
 */
olgm.unlistenAllByKey = function(listenerKeys) {
  listenerKeys.forEach(goog.events.unlistenByKey);
  listenerKeys.length = 0;
};


/**
 * Create a Google Maps feature using an OpenLayers one.
 * @param {ol.Feature} feature
 * @param {ol.Map=} opt_ol3map For reprojection purpose. If undefined, then
 *     `EPSG:3857` is used.
 * @return {google.maps.Data.Feature}
 * @api
 */
olgm.createGoogleMapsFeature = function(feature, opt_ol3map) {
  var geometry = feature.getGeometry();
  goog.asserts.assertInstanceof(geometry, ol.geom.Geometry);
  var gmapGeometry = olgm.createGoogleMapsGeometry(geometry, opt_ol3map);
  return new google.maps.Data.Feature({
    geometry: gmapGeometry
  });
};


/**
 * Create a Google Maps geometry using an OpenLayers one.
 * @param {ol.geom.Geometry} geometry
 * @param {ol.Map=} opt_ol3map For reprojection purpose. If undefined, then
 *     `EPSG:3857` is used.
 * @return {google.maps.Data.Geometry|google.maps.LatLng|google.maps.LatLng}
 * @api
 */
olgm.createGoogleMapsGeometry = function(geometry, opt_ol3map) {
  // FIXME - hardcoded, only points are currently supported
  goog.asserts.assertInstanceof(geometry, ol.geom.Point);
  return olgm.createGoogleMapsLatLng(geometry);
};


/**
 * Create a Google Maps LatLng object using an OpenLayers Point.
 * @param {ol.geom.Point} point
 * @param {ol.Map=} opt_ol3map For reprojection purpose. If undefined, then
 *     `EPSG:3857` is used.
 * @return {google.maps.LatLng}
 * @api
 */
olgm.createGoogleMapsLatLng = function(point, opt_ol3map) {
  var inProj = (opt_ol3map !== undefined) ?
      opt_ol3map.getView().getProjection() : 'EPSG:3857';
  var coordinates = point.getCoordinates();
  var lonLatCoords = ol.proj.transform(coordinates, inProj, 'EPSG:4326');
  return new google.maps.LatLng(lonLatCoords[1], lonLatCoords[0]);
};
