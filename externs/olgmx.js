// Ol3-GoogleMaps typedef externs, sorted alphabetically

/**
 * @type {Object}
 */
var olgmx;


/**
 * @typedef {{
 *   map: (!ol.Map),
 *   mapIconOptions: (olgmx.gm.MapIconOptions|undefined),
 *   watch: (olgmx.herald.WatchOptions|undefined)
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
 * Options for the MapIcon object if it exists
 * @type {olgmx.gm.MapIconOptions|undefined}
 * @api
 */
olgmx.OLGoogleMapsOptions.prototype.mapIconOptions;


/**
 * For each layer type, a boolean indicating whether the library should watch
 * and let layers of that type them be rendered by Google Maps or not.
 * Defaults to `true` for each option.
 * @type {olgmx.herald.WatchOptions|undefined}
 * @api
 */
olgmx.OLGoogleMapsOptions.prototype.watch;


/**
 * @type {Object}
 */
olgmx.gm = {};


/**
 * @typedef {{
 *   useCanvas: (boolean|undefined)
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
 * @typedef {{
 *   image: (boolean|undefined),
 *   tile: (boolean|undefined),
 *   vector: (boolean|undefined)
 * }}
 * @api
 */
olgmx.herald.WatchOptions;


/**
 * Whether to watch image layers or not
 * @type {boolean|undefined}
 * @api
 */
olgmx.herald.WatchOptions.prototype.image;


/**
 * Whether to watch tiled layers or not
 * @type {boolean|undefined}
 * @api
 */
olgmx.herald.WatchOptions.prototype.tile;


/**
 * Whether to watch vector layers or not
 * @type {boolean|undefined}
 * @api
 */
olgmx.herald.WatchOptions.prototype.vector;


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
