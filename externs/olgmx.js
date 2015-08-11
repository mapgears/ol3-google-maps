// Ol3-GoogleMaps typedef externs, sorted alphabetically

/**
 * @type {Object}
 */
var olgmx;


/**
 * @typedef {{
 *   gmap: (!google.maps.Map),
 *   ol3map: (!ol.Map)
 * }}
 * @api
 */
olgmx.OLGoogleMapsOptions;


/**
 * The GoogleMaps map.
 * @type {!google.maps.Map}
 * @api
 */
olgmx.OLGoogleMapsOptions.prototype.gmap;


/**
 * The OpenLayers map.
 * @type {!ol.Map}
 * @api
 */
olgmx.OLGoogleMapsOptions.prototype.ol3map;
