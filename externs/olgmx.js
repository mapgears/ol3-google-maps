// Ol3-GoogleMaps typedef externs, sorted alphabetically

/**
 * @type {Object}
 */
var olgmx;


/**
 * @typedef {{
 *   map: (!ol.Map),
 *   mapIconOptions: (olgmx.gm.MapIconOptions|undefined),
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
olgmx.gm = {};


/**
 * @typedef {{
 *   useCanvas: (boolean)
 * }}
 * @api
 */
olgmx.gm.MapIconOptions;


/**
 * Whether or not we should draw on canvases when we can, instead of using the
 * Google Maps API. This fixes z-index issues with labels on markers
 * @type {boolean|undefined}
 * @api
 */
olgmx.gm.MapIconOptions.prototype.useCanvas;


/**
 * @type {Object}
 */
olgmx.herald = {};


/**
 * @typedef {{
 *   feature: (ol.Feature),
 *   data: (!google.maps.Data),
 *   index: (number),
 *   mapIconOptions: (olgmx.gm.MapIconOptions)
 * }}
 * @api
 */
olgmx.herald.FeatureOptions;


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
