goog.provide('olgm.gm');

goog.require('ol.geom.LineString');
goog.require('ol.geom.Point');
goog.require('ol.geom.Polygon');
goog.require('ol.geom.MultiLineString');
goog.require('ol.geom.MultiPolygon');
goog.require('ol.proj');
goog.require('ol.style.Circle');
goog.require('ol.style.Icon');
goog.require('ol.style.RegularShape');
goog.require('olgm');
goog.require('olgm.asserts');
goog.require('olgm.gm.MapLabel');
goog.require('olgm.gm.MapIcon');


// === Data ===


/**
 * Create a Google Maps feature using an OpenLayers one.
 * @param {ol.Feature} feature feature to create
 * @param {ol.Map=} opt_ol3map For reprojection purpose. If undefined, then
 *     `EPSG:3857` is used.
 * @return {google.maps.Data.Feature} google Feature
 */
olgm.gm.createFeature = function(feature, opt_ol3map) {
  var geometry = /** @type {ol.geom.Geometry} */ (feature.getGeometry());
  var gmapGeometry = olgm.gm.createFeatureGeometry(geometry, opt_ol3map);
  return new google.maps.Data.Feature({
    geometry: gmapGeometry
  });
};


/**
 * Create a Google Maps geometry using an OpenLayers one.
 * @param {ol.geom.Geometry} geometry geometry to create
 * @param {ol.Map=} opt_ol3map For reprojection purpose. If undefined, then
 *     `EPSG:3857` is used.
 * @return {google.maps.Data.Geometry|google.maps.LatLng|google.maps.LatLng}
 * google Geometry or LatLng
 */
olgm.gm.createFeatureGeometry = function(geometry, opt_ol3map) {

  var gmapGeometry = null;

  if (geometry instanceof ol.geom.Point) {
    gmapGeometry = olgm.gm.createLatLng(geometry, opt_ol3map);
  } else if (geometry instanceof ol.geom.LineString ||
             geometry instanceof ol.geom.MultiLineString ||
             geometry instanceof ol.geom.Polygon ||
             geometry instanceof ol.geom.MultiPolygon) {
    gmapGeometry = olgm.gm.createGeometry(geometry, opt_ol3map);
  }

  olgm.asserts.assert(gmapGeometry !== null,
      'Expected geometry to be ol.geom.Point|LineString|MultiLineString|Polygon|MultiPolygon');

  return gmapGeometry;
};


/**
 * Create a Google Maps LatLng object using an OpenLayers Point.
 * @param {ol.geom.Point|ol.Coordinate} object coordinate to create
 * @param {ol.Map=} opt_ol3map For reprojection purpose. If undefined, then
 *     `EPSG:3857` is used.
 * @return {google.maps.LatLng} google LatLng object
 */
olgm.gm.createLatLng = function(object, opt_ol3map) {
  var inProj = (opt_ol3map !== undefined) ?
    opt_ol3map.getView().getProjection() : 'EPSG:3857';
  var coordinates;
  if (object instanceof ol.geom.Point) {
    coordinates = object.getCoordinates();
  } else {
    coordinates = object;
  }
  var lonLatCoords = ol.proj.transform(coordinates, inProj, 'EPSG:4326');
  return new google.maps.LatLng(lonLatCoords[1], lonLatCoords[0]);
};


/**
 * Create a Google Maps LineString or Polygon object using an OpenLayers one.
 * @param {ol.geom.LineString|ol.geom.Polygon|ol.geom.MultiLineString|ol.geom.MultiPolygon} geometry geometry to create
 * @param {ol.Map=} opt_ol3map For reprojection purpose. If undefined, then
 *     `EPSG:3857` is used.
 * @return {google.maps.Data.LineString|google.maps.Data.MultiLineString|google.maps.Data.Polygon} google
 * LineString or Polygon
 */
olgm.gm.createGeometry = function(geometry, opt_ol3map) {
  var inProj = (opt_ol3map !== undefined) ?
    opt_ol3map.getView().getProjection() : 'EPSG:3857';

  var gmapGeometry = null;

  if (geometry instanceof ol.geom.LineString) {
    var lineStringlatLngs = olgm.gm.genLatLngs_(
        geometry.getCoordinates(),
        inProj
    );
    gmapGeometry = new google.maps.Data.LineString(lineStringlatLngs);
  } else if (geometry instanceof ol.geom.Polygon) {
    var polygonlatLngs = olgm.gm.genLatLngs_(
        geometry.getCoordinates()[0],
        inProj
    );
    gmapGeometry = new google.maps.Data.Polygon([polygonlatLngs]);
  } else if (geometry instanceof ol.geom.MultiLineString) {
    var multiLineStringlatLngs = olgm.gm.genMultiLatLngs_(
        geometry.getCoordinates(),
        inProj
    );
    gmapGeometry = new google.maps.Data.MultiLineString(multiLineStringlatLngs);
  } else {
    //it must be MultiPolygon
    var multiPolygonlatLngs = olgm.gm.genMultiLatLngs_(
        geometry.getCoordinates()[0],
        inProj
    );
    gmapGeometry = new google.maps.Data.Polygon(multiPolygonlatLngs);
  }

  return gmapGeometry;
};


/**
 * Convert a list of OpenLayers coordinates to a list of google maps LatLng.
 *
 * @param {Array.<ol.Coordinate>} coordinates List of coordinate
 * @param {ol.ProjectionLike=} opt_inProj Projection of the features.
 * @return {Array.<google.maps.LatLng>} List of lat lng.
 * @private
 */
olgm.gm.genLatLngs_ = function(coordinates, opt_inProj) {
  var inProj = opt_inProj || 'EPSG:3857';
  var latLngs = [];
  var lonLatCoords;
  for (var i = 0, ii = coordinates.length; i < ii; i++) {
    lonLatCoords = ol.proj.transform(coordinates[i], inProj, 'EPSG:4326');
    latLngs.push(new google.maps.LatLng(lonLatCoords[1], lonLatCoords[0]));
  }
  return latLngs;
};


/**
 * Convert a list of OpenLayers multi-coordinates to a list of multi
 * google maps LatLng.
 *
 * @param {Array.<Array.<ol.Coordinate>>} coordinates List of multi coordinate
 * @param {ol.ProjectionLike=} opt_inProj Projection of the features.
 * @return {Array.<Array.<google.maps.LatLng>>} List of multi lat lng.
 * @private
 */
olgm.gm.genMultiLatLngs_ = function(coordinates, opt_inProj) {
  var inProj = opt_inProj || 'EPSG:3857';
  var multiLatLngs = [];
  for (var i = 0, len = coordinates.length; i < len; i++) {
    multiLatLngs.push(olgm.gm.genLatLngs_(coordinates[i], inProj));
  }
  return multiLatLngs;
};


// === Style ===


/**
 * Create a Google Maps data style options from an OpenLayers object.
 * @param {ol.style.Style|ol.StyleFunction|ol.layer.Vector|ol.Feature}
 * object style object
 * @param {olgmx.gm.MapIconOptions} mapIconOptions map icon options
 * @param {number=} opt_index index for the object
 * @return {?google.maps.Data.StyleOptions} google style options
 */
olgm.gm.createStyle = function(object, mapIconOptions, opt_index) {
  var gmStyle = null;
  var style = olgm.getStyleOf(object);
  if (style) {
    gmStyle = olgm.gm.createStyleInternal(style, mapIconOptions, opt_index);
  }
  return gmStyle;
};


/**
 * Create a Google Maps data style options from an OpenLayers style object.
 * @param {ol.style.Style} style style object
 * @param {olgmx.gm.MapIconOptions} mapIconOptions map icon options
 * @param {number=} opt_index index for the object
 * @return {google.maps.Data.StyleOptions} google style options
 */
olgm.gm.createStyleInternal = function(style, mapIconOptions, opt_index) {

  var gmStyle = /** @type {google.maps.Data.StyleOptions} */ ({});

  // strokeColor
  // strokeOpacity
  // strokeWeight
  var stroke = style.getStroke();
  if (stroke) {
    var strokeColor = stroke.getColor();
    if (strokeColor) {
      gmStyle['strokeColor'] = olgm.getColor(strokeColor);
      var strokeOpacity = olgm.getColorOpacity(strokeColor);
      if (strokeOpacity !== null) {
        gmStyle['strokeOpacity'] = strokeOpacity;
      }
    }

    var strokeWidth = stroke.getWidth();
    if (strokeWidth) {
      gmStyle['strokeWeight'] = strokeWidth;
    }
  }

  // fillColor
  // fillOpacity
  var fill = style.getFill();
  if (fill) {
    var fillColor = fill.getColor();
    if (fillColor) {
      gmStyle['fillColor'] = olgm.getColor(fillColor);
      var fillOpacity = olgm.getColorOpacity(fillColor);
      if (fillOpacity !== null) {
        gmStyle['fillOpacity'] = fillOpacity;
      }
    }
  }

  var image = style.getImage();
  if (image) {

    var gmIcon = {};
    var gmSymbol = {};
    var useCanvas = mapIconOptions.useCanvas !== undefined ?
      mapIconOptions.useCanvas : false;

    if (image instanceof ol.style.Circle ||
        image instanceof ol.style.RegularShape) {
      // --- ol.style.Circle ---
      if (image instanceof ol.style.Circle) {
        gmSymbol['path'] = google.maps.SymbolPath.CIRCLE;
      } else if (image instanceof ol.style.RegularShape) {
        // Google Maps support SVG Paths. We'll build one manually.
        var path = 'M ';

        // Get a few variables from the image style;
        var nbPoints = image.getPoints();
        var outerRadius = image.getRadius();
        var innerRadius = image.getRadius2() !== undefined ?
          image.getRadius2() : image.getRadius();
        var size = 0.1;
        var rotation = image.getRotation() + image.getAngle();

        if (innerRadius == 0 && image.getRadius2() === undefined) {
          nbPoints = nbPoints / 2;
        }

        if (innerRadius !== outerRadius) {
          nbPoints = nbPoints * 2;
        }

        for (var i = 0; i < nbPoints; i++) {
          var radius = i % 2 == 0 ? outerRadius : innerRadius;
          var angle = (i * 2 * Math.PI / nbPoints) - (Math.PI / 2) + rotation;

          var x = size * radius * Math.cos(angle);
          var y = size * radius * Math.sin(angle);
          path += x + ',' + y + ' ';
        }

        // Close the path
        path += 'Z';
        gmSymbol['path'] = path;
      }

      var imageStroke = image.getStroke();
      if (imageStroke) {
        var imageStrokeColor = imageStroke.getColor();
        if (imageStrokeColor) {
          gmSymbol['strokeColor'] = olgm.getColor(imageStrokeColor);
        }

        gmSymbol['strokeWeight'] = imageStroke.getWidth();
      }

      var imageFill = image.getFill();
      if (imageFill) {
        var imageFillColor = imageFill.getColor();
        if (imageFillColor) {
          gmSymbol['fillColor'] = olgm.getColor(imageFillColor);

          var imageFillOpacity = olgm.getColorOpacity(imageFillColor);
          if (imageFillOpacity !== null) {
            gmSymbol['fillOpacity'] = imageFillOpacity;
          } else {
            // Google Maps default fill opacity of images is `0`. In ol3,
            // it's `1`.
            gmSymbol['fillOpacity'] = 1;
          }
        }
      }

      var imageRadius = image.getRadius();
      if (imageRadius) {
        gmSymbol['scale'] = imageRadius;
      }
    } else if (image instanceof ol.style.Icon && !useCanvas) {
      // --- ol.style.Icon ---

      var imageSrc = image.getSrc();
      if (imageSrc) {
        gmSymbol['url'] = imageSrc;
      }

      var imageScale = image.getScale();

      var imageAnchor = image.getAnchor();
      if (imageAnchor) {
        if (imageScale !== undefined) {
          gmSymbol['anchor'] = new google.maps.Point(
              imageAnchor[0] * imageScale, imageAnchor[1] * imageScale);
        } else {
          gmSymbol['anchor'] = new google.maps.Point(
              imageAnchor[0], imageAnchor[1]);
        }
      }

      var imageOrigin = image.getOrigin();
      if (imageOrigin) {
        gmSymbol['origin'] = new google.maps.Point(
            imageOrigin[0], imageOrigin[1]);
      }

      var imageSize = image.getSize();
      if (imageSize) {
        gmSymbol['size'] = new google.maps.Size(imageSize[0], imageSize[1]);

        if (imageScale !== undefined) {
          gmSymbol['scaledSize'] = new google.maps.Size(
              imageSize[0] * imageScale, imageSize[1] * imageScale);
        }
      }

      // NOTE - google.maps.Icon does not support opacity
    }

    if (Object.keys(gmIcon).length) {
      gmStyle['icon'] = /** @type {google.maps.Icon} */ (gmIcon);
    } else if (Object.keys(gmSymbol).length) {
      gmStyle['icon'] = /** @type {google.maps.Symbol} */ (gmSymbol);
    }
  }

  // if, at this very last point, there aren't any style options that have
  // been set, then tell Google Maps to render the feature invisible because
  // we're dealing with an empty `ol.style.Style` object.
  if (Object.keys(/** @type {!Object} */ (gmStyle)).length === 0) {
    gmStyle['visible'] = false;
  } else if (opt_index !== undefined) {
    var zIndex = opt_index * 2;
    gmStyle['zIndex'] = zIndex;
  }

  return gmStyle;
};


// === Label ===


/**
 * Create a MapLabel object from a text style and Lat/Lng location.
 * @param {ol.style.Text} textStyle style for the text
 * @param {google.maps.LatLng} latLng position of the label
 * @param {number} index index for the label
 * @return {olgm.gm.MapLabel} map label
 */
olgm.gm.createLabel = function(textStyle, latLng, index) {

  var labelOptions = {
    align: 'center',
    position: latLng,
    zIndex: index * 2 + 1
  };

  var text = textStyle.getText();
  if (text) {
    labelOptions['text'] = text;
  }

  var font = textStyle.getFont();
  if (font) {
    labelOptions['font'] = font;
  }

  var fill = textStyle.getFill();
  if (fill) {
    var fillColor = fill.getColor();
    if (fillColor) {
      labelOptions['fontColor'] = fillColor;
    }
  }

  var stroke = textStyle.getStroke();
  if (stroke) {
    var strokeColor = stroke.getColor();
    if (strokeColor) {
      labelOptions['strokeColor'] = strokeColor;
    }

    var strokeWidth = stroke.getWidth();
    if (strokeWidth) {
      labelOptions['strokeWeight'] = strokeWidth;
    }
  }

  var offsetX = textStyle.getOffsetX();
  if (offsetX) {
    labelOptions['offsetX'] = offsetX;
  }

  var offsetY = textStyle.getOffsetY();
  if (offsetY) {
    labelOptions['offsetY'] = offsetY;
  }

  var textAlign = textStyle.getTextAlign();
  if (textAlign) {
    labelOptions['textAlign'] = textAlign;
  }

  var textBaseline = textStyle.getTextBaseline();
  if (textBaseline) {
    labelOptions['textBaseline'] = textBaseline;
  }

  return new olgm.gm.MapLabel(labelOptions);
};


/**
 * Create a mapIcon object from an image style and Lat/Lng location
 * @param {ol.style.Icon} iconStyle style for the icon
 * @param {google.maps.LatLng} latLng position of the label
 * @param {number} index index for the label
 * @return {olgm.gm.MapIcon} map label
 */
olgm.gm.createMapIcon = function(iconStyle, latLng, index) {

  var iconOptions = {
    align: 'center',
    position: latLng,
    zIndex: index * 2 + 1
  };

  return new olgm.gm.MapIcon(iconStyle, iconOptions);
};
