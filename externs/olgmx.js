// Ol3-GoogleMaps typedef externs, sorted alphabetically

/**
 * @type {Object}
 */
var olgmx;


/**
 * @typedef {{
 *   map: (!ol.Map),
 *   watchVector: (boolean|undefined)
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
 * Whether the library should watch vector layers and let them be rendered
 * by Google Maps with the latter is activated or not.  Defaults to `true`.
 * @type {boolean|undefined}
 * @api
 */
olgmx.OLGoogleMapsOptions.prototype.watchVector;


/**
 * @type {Object}
 */
olgmx.layer = {};


/**
 * @typedef {{
 *   mapTypeId: (google.maps.MapTypeId.<(number|string)>|string|undefined),
 *   styles: (Array.<google.maps.MapTypeStyle>|undefined)
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


/**
 * The Google Maps styles to apply to the map
 * @type {Array.<google.maps.MapTypeStyle>|undefined}
 * @api
 */
olgmx.layer.GoogleOptions.prototype.styles;
