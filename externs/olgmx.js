// Ol3-GoogleMaps typedef externs, sorted alphabetically

/**
 * @type {Object}
 */
var olgmx;


/**
 * @typedef {{
 *   map: (!ol.Map)
 * }}
 * @api
 */
olgmx.OLGoogleMapsOptions;


/**
 * The OpenLayers map.
 * @type {!ol.Map}
 * @api
 */
olgmx.OLGoogleMapsOptions.prototype.map;


/**
 * @type {Object}
 */
olgmx.layer = {};


/**
 * @typedef {{
 *   mapTypeId: (google.maps.MapTypeId.<(number|string)>|string|undefined)
 * }}
 * @api
 */
olgmx.layer.GoogleOptions;


/**
 * The Google Maps mapTypeId of the layer. Defaults to
 * `google.maps.MapTypeId.ROADMAP`.
 * @type {google.maps.MapTypeId.<(number|string)>|string|undefined}
 * @api
 */
olgmx.layer.GoogleOptions.prototype.mapTypeId;
