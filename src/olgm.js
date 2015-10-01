goog.provide('olgm');

goog.require('goog.asserts');
goog.require('goog.events');


/**
 * @param {Array.<goog.events.Key>} listenerKeys
 */
olgm.unlistenAllByKey = function(listenerKeys) {
  listenerKeys.forEach(ol.Observable.unByKey);
  listenerKeys.length = 0;
};


// === Feature and Geometry ===


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
  var gmapGeometry = olgm.createGoogleMapsFeatureGeometry(geometry, opt_ol3map);
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
olgm.createGoogleMapsFeatureGeometry = function(geometry, opt_ol3map) {

  var gmapGeometry = null;

  if (geometry instanceof ol.geom.Point) {
    gmapGeometry = olgm.createGoogleMapsLatLng(geometry, opt_ol3map);
  } else if (geometry instanceof ol.geom.LineString ||
             geometry instanceof ol.geom.Polygon) {
    gmapGeometry = olgm.createGoogleMapsGeometry(geometry, opt_ol3map);
  }

  goog.asserts.assert(gmapGeometry !== null,
      'GoogleMaps geometry should not be null');

  return gmapGeometry;
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


/**
 * Create a Google Maps LineString or Polygon object using an OpenLayers one.
 * @param {ol.geom.LineString|ol.geom.Polygon} geometry
 * @param {ol.Map=} opt_ol3map For reprojection purpose. If undefined, then
 *     `EPSG:3857` is used.
 * @return {google.maps.Data.LineString|google.maps.Data.Polygon}
 * @api
 */
olgm.createGoogleMapsGeometry = function(geometry, opt_ol3map) {
  var inProj = (opt_ol3map !== undefined) ?
      opt_ol3map.getView().getProjection() : 'EPSG:3857';

  var latLngs = [];
  var lonLatCoords;

  var coordinates;
  if (geometry instanceof ol.geom.LineString) {
    coordinates = geometry.getCoordinates();
  } else {
    coordinates = geometry.getCoordinates()[0];
  }

  for (var i = 0, len = coordinates.length; i < len; i++) {
    lonLatCoords = ol.proj.transform(coordinates[i], inProj, 'EPSG:4326');
    latLngs.push(new google.maps.LatLng(lonLatCoords[1], lonLatCoords[0]));
  }

  var gmapGeometry = null;
  if (geometry instanceof ol.geom.LineString) {
    gmapGeometry = new google.maps.Data.LineString(latLngs);
  } else {
    gmapGeometry = new google.maps.Data.Polygon([latLngs]);
  }

  return gmapGeometry;
};


// === Style ===


/**
 * Create a Google Maps data style options from an OpenLayers style.
 * @param {ol.style.Style|ol.style.StyleFunction|ol.layer.Vector|ol.Feature} object
 * @return {?google.maps.Data.StyleOptions}
 * @api
 */
olgm.createGMStyle = function(object) {

  var style = null;
  var gmStyle = null;

  if (object instanceof ol.style.Style) {
    style = object;
  } else if (object instanceof ol.layer.Vector ||
             object instanceof ol.Feature) {
    style = object.getStyle();
    if (style && style instanceof Function) {
      style = style()[0]; // todo - support multiple styles ?
    }
  } else if (object instanceof Function) {
    style = object()[0]; // todo - support multiple styles ?
  }

  if (style) {
    gmStyle = olgm.createGMStyleFromOLStyle(style);
  }

  return gmStyle;
};


/**
 * Create a Google Maps data style options from an OpenLayers style object.
 * @param {ol.style.Style} style
 * @return {google.maps.Data.StyleOptions}
 */
olgm.createGMStyleFromOLStyle = function(style) {

  var gmStyle = /** @type {google.maps.Data.StyleOptions} */ ({});

  // strokeColor
  // strokeWeight
  var stroke = style.getStroke();
  if (stroke) {
    gmStyle['strokeColor'] = stroke.getColor();
    gmStyle['strokeWeight'] = stroke.getWidth();
  }

  // fillColor
  var fill = style.getFill();
  if (fill) {
    gmStyle['fillColor'] = fill.getColor();
  }

  var image = style.getImage();
  if (image) {
    var gmIcon = {};
    var gmSymbol = {};

    if (image instanceof ol.style.Circle) {
      // --- ol.style.Circle ---
      gmSymbol['path'] = google.maps.SymbolPath.CIRCLE;

      var imageStroke = image.getStroke();
      if (imageStroke) {
        gmSymbol['strokeColor'] = imageStroke.getColor();
        gmSymbol['strokeWeight'] = imageStroke.getWidth();
      }

      var imageFill = image.getFill();
      if (imageFill) {
        gmSymbol['fillColor'] = imageFill.getColor();
      }

      var imageRadius = image.getRadius();
      if (imageRadius) {
        gmSymbol['scale'] = imageRadius;
      }
    } else if (image instanceof ol.style.Icon) {
      // --- ol.style.Icon ---

      var imageSrc = image.getSrc();
      if (imageSrc) {
        gmSymbol['url'] = imageSrc;
      }

      var imageAnchor = image.getAnchor();
      if (imageAnchor) {
        gmSymbol['anchor'] = imageAnchor;
      }

      // FIXME - origin is not working for an unknown reason
      /*
      var imageOrigin = image.getOrigin();
      if (imageOrigin) {
        gmSymbol['origin'] = imageOrigin;
      }
      */

      var imageSize = image.getSize();
      if (imageSize) {
        gmSymbol['size'] = imageSize;
      }

      // NOTE - google.maps.Icon does not support opacity
    }

    if (Object.keys(gmIcon).length) {
      gmStyle['icon'] = /** @type {google.maps.Icon} */ (gmIcon);
    } else if (Object.keys(gmSymbol).length) {
      gmStyle['icon'] = /** @type {google.maps.Symbol} */ (gmSymbol);
    }
  }

  return gmStyle;
};
