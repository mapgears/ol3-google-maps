/**
 * @module olgm/gm
 */
import LineString from 'ol/geom/LineString.js';
import Point from 'ol/geom/Point.js';
import Polygon from 'ol/geom/Polygon.js';
import MultiLineString from 'ol/geom/MultiLineString.js';
import MultiPolygon from 'ol/geom/MultiPolygon.js';
import MultiPoint from 'ol/geom/MultiPoint.js';
import {transform} from 'ol/proj.js';
import Circle from 'ol/style/Circle.js';
import Icon from 'ol/style/Icon.js';
import RegularShape from 'ol/style/RegularShape.js';
import {getStyleOf, getColor, getColorOpacity} from './util.js';
import {assert} from './asserts.js';
import MapLabel from './gm/MapLabel.js';
import MapIcon from './gm/MapIcon.js';


/**
 * Create a Google Maps feature using an OpenLayers one.
 * @param {module:ol/Feature} feature feature to create
 * @param {module:ol/PluggableMap=} opt_ol3map For reprojection purpose. If undefined, then
 *     `EPSG:3857` is used.
 * @return {google.maps.Data.Feature} google Feature
 */
export function createFeature(feature, opt_ol3map) {
  const geometry = /** @type {module:ol/geom/Geometry} */ (feature.getGeometry());
  const gmapGeometry = createFeatureGeometry(geometry, opt_ol3map);
  return new google.maps.Data.Feature({
    geometry: gmapGeometry
  });
}


/**
 * Create a Google Maps geometry using an OpenLayers one.
 * @param {module:ol/geom/Geometry} geometry geometry to create
 * @param {module:ol/PluggableMap=} opt_ol3map For reprojection purpose. If undefined, then
 *     `EPSG:3857` is used.
 * @return {google.maps.Data.Geometry|google.maps.LatLng}
 * google Geometry or LatLng
 */
export function createFeatureGeometry(geometry, opt_ol3map) {

  let gmapGeometry = null;

  if (geometry instanceof Point) {
    gmapGeometry = createLatLng(geometry, opt_ol3map);
  } else if (geometry instanceof MultiPoint ||
             geometry instanceof LineString ||
             geometry instanceof MultiLineString ||
             geometry instanceof Polygon ||
             geometry instanceof MultiPolygon) {
    gmapGeometry = createGeometry(geometry, opt_ol3map);
  }

  assert(gmapGeometry !== null,
    'Expected geometry to be module:ol/geom/Point|MultiPoint|LineString|MultiLineString|Polygon|MultiPolygon');

  return gmapGeometry;
}


/**
 * Create a Google Maps LatLng object using an OpenLayers Point.
 * @param {module:ol/geom/Point|module:ol/coordinate~Coordinate} object coordinate to create
 * @param {module:ol/PluggableMap=} opt_ol3map For reprojection purpose. If undefined, then
 *     `EPSG:3857` is used.
 * @return {google.maps.LatLng} google LatLng object
 */
export function createLatLng(object, opt_ol3map) {
  const inProj = (opt_ol3map !== undefined) ?
    opt_ol3map.getView().getProjection() : 'EPSG:3857';
  let coordinates;
  if (object instanceof Point) {
    coordinates = object.getCoordinates();
  } else {
    coordinates = object;
  }
  const lonLatCoords = transform(coordinates, inProj, 'EPSG:4326');
  return new google.maps.LatLng(lonLatCoords[1], lonLatCoords[0]);
}


/**
 * Create a Google Maps LineString or Polygon object using an OpenLayers one.
 * @param {module:ol/geom/MultiPoint|module:ol/geom/LineString|module:ol/geom/Polygon|module:ol/geom/MultiLineString|module:ol/geom/MultiPolygon} geometry geometry to create
 * @param {module:ol/PluggableMap=} opt_ol3map For reprojection purpose. If undefined, then
 *     `EPSG:3857` is used.
 * @return {google.maps.Data.MultiPoint|google.maps.Data.LineString|google.maps.Data.MultiLineString|google.maps.Data.Polygon|google.maps.Data.MultiPolygon} google
 * LineString or Polygon
 */
export function createGeometry(geometry, opt_ol3map) {
  const inProj = (opt_ol3map !== undefined) ?
    opt_ol3map.getView().getProjection() : 'EPSG:3857';

  let gmapGeometry = null;

  if (geometry instanceof LineString) {
    const lineStringlatLngs = genLatLngs_(
      geometry.getCoordinates(),
      inProj
    );
    gmapGeometry = new google.maps.Data.LineString(lineStringlatLngs);
  } else if (geometry instanceof Polygon) {
    const polygonlatLngs = genLatLngs_(
      geometry.getCoordinates()[0],
      inProj
    );
    gmapGeometry = new google.maps.Data.Polygon([polygonlatLngs]);
  } else if (geometry instanceof MultiLineString) {
    const multiLineStringlatLngs = genMultiLatLngs_(
      geometry.getCoordinates(),
      inProj
    );
    gmapGeometry = new google.maps.Data.MultiLineString(multiLineStringlatLngs);
  } else if (geometry instanceof MultiPolygon) {
    const multiPolygons = genMultiPolygon_(
      geometry.getPolygons(),
      inProj
    );
    gmapGeometry = new google.maps.Data.MultiPolygon(multiPolygons);
  } else if (geometry instanceof MultiPoint) {
    const multiPoints = genLatLngs_(
      geometry.getCoordinates(),
      inProj
    );
    gmapGeometry = new google.maps.Data.MultiPoint(multiPoints);
  }

  return gmapGeometry;
}


/**
 * Convert a list of OpenLayers coordinates to a list of google maps LatLng.
 *
 * @param {Array<module:ol/coordinate~Coordinate>} coordinates List of coordinate
 * @param {module:ol/proj~ProjectionLike=} opt_inProj Projection of the features.
 * @return {Array<google.maps.LatLng>} List of lat lng.
 * @private
 */
export function genLatLngs_(coordinates, opt_inProj) {
  const inProj = opt_inProj || 'EPSG:3857';
  const latLngs = [];
  let lonLatCoords;
  for (let i = 0, ii = coordinates.length; i < ii; i++) {
    lonLatCoords = transform(coordinates[i], inProj, 'EPSG:4326');
    latLngs.push(new google.maps.LatLng(lonLatCoords[1], lonLatCoords[0]));
  }
  return latLngs;
}


/**
 * Convert a list of OpenLayers multi-coordinates to a list of multi
 * google maps LatLng.
 *
 * @param {Array<Array<module:ol/coordinate~Coordinate>>} coordinates List of multi coordinate
 * @param {module:ol/proj~ProjectionLike=} opt_inProj Projection of the features.
 * @return {Array<Array<google.maps.LatLng>>} List of multi lat lng.
 * @private
 */
export function genMultiLatLngs_(coordinates, opt_inProj) {
  const inProj = opt_inProj || 'EPSG:3857';
  const multiLatLngs = [];
  for (let i = 0, len = coordinates.length; i < len; i++) {
    multiLatLngs.push(genLatLngs_(coordinates[i], inProj));
  }
  return multiLatLngs;
}


/**
 * Convert a list of OpenLayers polygons to a list of google maps polygons.
 *
 * @param {Array<module:ol/geom/Polygon>} polygons List of polygons.
 * @param {module:ol/proj~ProjectionLike=} opt_inProj Projection of the features.
 * @return {Array<google.maps.Data.Polygon>} List of polygons.
 * @private
 */
export function genMultiPolygon_(polygons, opt_inProj) {
  const mutliPolygons = [];
  for (let i = 0, len = polygons.length; i < len; i++) {
    const latLgns = genMultiLatLngs_(polygons[i].getCoordinates(), opt_inProj);
    const multiPolygon = new google.maps.Data.Polygon(latLgns);
    mutliPolygons.push(multiPolygon);
  }
  return mutliPolygons;
}


// === Style ===


/**
 * Create a Google Maps data style options from an OpenLayers object.
 * @param {module:ol/style/Style|module:ol/style/Style~StyleFunction|module:ol/layer/Vector|module:ol/Feature}
 * object style object
 * @param {module:olgm/gm/MapIcon~Options} mapIconOptions map icon options
 * @param {number=} opt_index index for the object
 * @return {?google.maps.Data.StyleOptions} google style options
 */
export function createStyle(object, mapIconOptions, opt_index) {
  let gmStyle = null;
  const style = getStyleOf(object);
  if (style) {
    gmStyle = createStyleInternal(style, mapIconOptions, opt_index);
  }
  return gmStyle;
}


/**
 * Create a Google Maps data style options from an OpenLayers style object.
 * @param {module:ol/style/Style} style style object
 * @param {module:olgm/gm/MapIcon~Options} mapIconOptions map icon options
 * @param {number=} opt_index index for the object
 * @return {google.maps.Data.StyleOptions} google style options
 */
export function createStyleInternal(style, mapIconOptions, opt_index) {

  const gmStyle = /** @type {google.maps.Data.StyleOptions} */ ({});

  // strokeColor
  // strokeOpacity
  // strokeWeight
  const stroke = style.getStroke();
  if (stroke) {
    const strokeColor = stroke.getColor();
    if (strokeColor) {
      gmStyle['strokeColor'] = getColor(strokeColor);
      const strokeOpacity = getColorOpacity(strokeColor);
      if (strokeOpacity !== null) {
        gmStyle['strokeOpacity'] = strokeOpacity;
      }
    }

    const strokeWidth = stroke.getWidth();
    if (strokeWidth) {
      gmStyle['strokeWeight'] = strokeWidth;
    }
  }

  // fillColor
  // fillOpacity
  const fill = style.getFill();
  if (fill) {
    const fillColor = fill.getColor();
    if (fillColor) {
      gmStyle['fillColor'] = getColor(fillColor);
      const fillOpacity = getColorOpacity(fillColor);
      if (fillOpacity !== null) {
        gmStyle['fillOpacity'] = fillOpacity;
      }
    }
  }

  const image = style.getImage();
  if (image) {

    const gmIcon = {};
    const gmSymbol = {};
    const useCanvas = mapIconOptions.useCanvas !== undefined ?
      mapIconOptions.useCanvas : false;

    if (image instanceof Circle || image instanceof RegularShape) {
      // --- module:ol/style/Circle ---
      if (image instanceof Circle) {
        gmSymbol['path'] = google.maps.SymbolPath.CIRCLE;
      } else if (image instanceof RegularShape) {
        // Google Maps support SVG Paths. We'll build one manually.
        let path = 'M ';

        // Get a few variables from the image style;
        let nbPoints = image.getPoints();
        const outerRadius = image.getRadius();
        const innerRadius = image.getRadius2() !== undefined ?
          image.getRadius2() : image.getRadius();
        const size = 0.1;
        const rotation = image.getRotation() + image.getAngle();

        if (innerRadius == 0 && image.getRadius2() === undefined) {
          nbPoints = nbPoints / 2;
        }

        if (innerRadius !== outerRadius) {
          nbPoints = nbPoints * 2;
        }

        for (let i = 0; i < nbPoints; i++) {
          const radius = i % 2 == 0 ? outerRadius : innerRadius;
          const angle = (i * 2 * Math.PI / nbPoints) - (Math.PI / 2) + rotation;

          const x = size * radius * Math.cos(angle);
          const y = size * radius * Math.sin(angle);
          path += x + ',' + y + ' ';
        }

        // Close the path
        path += 'Z';
        gmSymbol['path'] = path;
      }

      const imageStroke = image.getStroke();
      if (imageStroke) {
        const imageStrokeColor = imageStroke.getColor();
        if (imageStrokeColor) {
          gmSymbol['strokeColor'] = getColor(imageStrokeColor);
        }

        gmSymbol['strokeWeight'] = imageStroke.getWidth();
      }

      const imageFill = image.getFill();
      if (imageFill) {
        const imageFillColor = imageFill.getColor();
        if (imageFillColor) {
          gmSymbol['fillColor'] = getColor(imageFillColor);

          const imageFillOpacity = getColorOpacity(imageFillColor);
          if (imageFillOpacity !== null) {
            gmSymbol['fillOpacity'] = imageFillOpacity;
          } else {
            // Google Maps default fill opacity of images is `0`. In ol3,
            // it's `1`.
            gmSymbol['fillOpacity'] = 1;
          }
        }
      }

      const imageRadius = image.getRadius();
      if (imageRadius) {
        gmSymbol['scale'] = imageRadius;
      }
    } else if (image instanceof Icon && !useCanvas) {
      // --- module:ol/style/Icon ---

      const imageSrc = image.getSrc();
      if (imageSrc) {
        gmSymbol['url'] = imageSrc;
      }

      const imageScale = image.getScale();

      const imageAnchor = image.getAnchor();
      if (imageAnchor) {
        if (imageScale !== undefined) {
          gmSymbol['anchor'] = new google.maps.Point(
            imageAnchor[0] * imageScale, imageAnchor[1] * imageScale);
        } else {
          gmSymbol['anchor'] = new google.maps.Point(
            imageAnchor[0], imageAnchor[1]);
        }
      }

      const imageOrigin = image.getOrigin();
      if (imageOrigin) {
        gmSymbol['origin'] = new google.maps.Point(
          imageOrigin[0], imageOrigin[1]);
      }

      const imageSize = image.getSize();
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
  // we're dealing with an empty `module:ol/style/Style` object.
  if (Object.keys(/** @type {!Object} */ (gmStyle)).length === 0) {
    gmStyle['visible'] = false;
  } else if (opt_index !== undefined) {
    const zIndex = opt_index * 2;
    gmStyle['zIndex'] = zIndex;
  }

  return gmStyle;
}


// === Label ===


/**
 * Create a MapLabel object from a text style and Lat/Lng location.
 * @param {module:ol/style/Text} textStyle style for the text
 * @param {google.maps.LatLng} latLng position of the label
 * @param {number} index index for the label
 * @param {string=} opt_pane name of Google Maps pane to use (defaults to 'markerLayer' if not specified)
 * @return {module:olgm/gm/MapLabel} map label
 */
export function createLabel(textStyle, latLng, index, opt_pane) {

  const labelOptions = {
    align: 'center',
    position: latLng,
    olgm_pane: opt_pane,
    zIndex: index * 2 + 1
  };

  const text = textStyle.getText();
  if (text) {
    labelOptions['text'] = text;
  }

  const font = textStyle.getFont();
  if (font) {
    labelOptions['font'] = font;
  }

  const fill = textStyle.getFill();
  if (fill) {
    const fillColor = fill.getColor();
    if (fillColor) {
      labelOptions['fontColor'] = fillColor;
    }
  }

  const stroke = textStyle.getStroke();
  if (stroke) {
    const strokeColor = stroke.getColor();
    if (strokeColor) {
      labelOptions['strokeColor'] = strokeColor;
    }

    const strokeWidth = stroke.getWidth();
    if (strokeWidth) {
      labelOptions['strokeWeight'] = strokeWidth;
    }
  }

  const offsetX = textStyle.getOffsetX();
  if (offsetX) {
    labelOptions['offsetX'] = offsetX;
  }

  const offsetY = textStyle.getOffsetY();
  if (offsetY) {
    labelOptions['offsetY'] = offsetY;
  }

  const textAlign = textStyle.getTextAlign();
  if (textAlign) {
    labelOptions['textAlign'] = textAlign;
  }

  const textBaseline = textStyle.getTextBaseline();
  if (textBaseline) {
    labelOptions['textBaseline'] = textBaseline;
  }

  return new MapLabel(labelOptions);
}


/**
 * Create a mapIcon object from an image style and Lat/Lng location
 * @param {module:ol/style/Icon} iconStyle style for the icon
 * @param {google.maps.LatLng} latLng position of the label
 * @param {number} index index for the label
 * @param {string=} opt_pane name of Google Maps pane to use (defaults to 'markerLayer' if not specified)
 * @return {module:olgm/gm/MapIcon} map icon
 */
export function createMapIcon(iconStyle, latLng, index, opt_pane) {

  const iconOptions = {
    align: 'center',
    position: latLng,
    olgm_pane: opt_pane,
    zIndex: index * 2 + 1
  };

  return new MapIcon(iconStyle, iconOptions);
}
