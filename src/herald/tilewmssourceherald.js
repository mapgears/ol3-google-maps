goog.provide('olgm.herald.TileWMSSource');

goog.require('olgm.herald.Source');



/**
 * Listen to a Tile WMS layer
 * @param {!ol.Map} ol3map
 * @param {!google.maps.Map} gmap
 * @constructor
 * @extends {olgm.herald.Source}
 */
olgm.herald.TileWMSSource = function(ol3map, gmap) {
  /**
  * @type {Array.<olgm.herald.TileWMSSource.LayerCache>}
  * @private
  */
  this.cache_ = [];

  /**
  * @type {Array.<ol.layer.Tile>}
  * @private
  */
  this.layers_ = [];

  goog.base(this, ol3map, gmap);
};
goog.inherits(olgm.herald.TileWMSSource, olgm.herald.Source);


/**
 * @param {ol.layer.Base} layer
 * @override
 */
olgm.herald.TileWMSSource.prototype.watchLayer = function(layer) {
  var tileLayer = /** {@type ol.layer.Tile} */ (layer);
  goog.asserts.assertInstanceof(tileLayer, ol.layer.Tile);

  // Source required
  var source = tileLayer.getSource();
  if (!source) {
    return;
  }
  goog.asserts.assertInstanceof(source, ol.source.TileWMS);

  this.layers_.push(tileLayer);

  // opacity
  var opacity = tileLayer.getOpacity();

  var cacheItem = /** {@type olgm.herald.TileWMSSource.LayerCache} */ ({
    googleWMSLayer: null,
    layer: tileLayer,
    listenerKeys: [],
    opacity: opacity
  });

  var getTileUrlFunction = source.getTileUrlFunction();
  var proj = ol.proj.get('EPSG:3857');

  var googleGetTileUrlFunction = function(coords, zoom) {
    var ol3Coords = [zoom, coords.x, (-coords.y) - 1];
    return getTileUrlFunction(ol3Coords, 1, proj);
  };

  var tileSize = new google.maps.Size(256, 256);

  var options = {
    'getTileUrl': googleGetTileUrlFunction,
    'tileSize': tileSize,
    'isPng': true
  };

  // Create the WMS layer on the google layer
  var googleWMSLayer = new google.maps.ImageMapType(options);
  if (tileLayer.getVisible()) {
    this.gmap.overlayMapTypes.push(googleWMSLayer);
  }
  cacheItem.googleWMSLayer = googleWMSLayer;

  // Hide the google layer when the ol3 layer is invisible
  cacheItem.listenerKeys.push(tileLayer.on('change:visible',
      this.handleVisibleChange_.bind(this, cacheItem), this));

  // Activate the cache item
  this.activateCacheItem_(cacheItem);
  this.cache_.push(cacheItem);
};


/**
 * Unwatch the WMS tile layer
 * @param {ol.layer.Base} layer
 * @override
 */
olgm.herald.TileWMSSource.prototype.unwatchLayer = function(layer) {
  var tileLayer = /** {@type ol.layer.Tile} */ (layer);
  goog.asserts.assertInstanceof(tileLayer, ol.layer.Tile);

  var index = this.layers_.indexOf(tileLayer);
  if (index !== -1) {
    this.layers_.splice(index, 1);

    var cacheItem = this.cache_[index];
    olgm.unlistenAllByKey(cacheItem.listenerKeys);

    // opacity
    tileLayer.setOpacity(cacheItem.opacity);

    this.cache_.splice(index, 1);
  }
};


/**
 * Activate all cache items
 * @api
 */
olgm.herald.TileWMSSource.prototype.activate = function() {
  olgm.herald.TileWMSSource.base(this, 'activate'); // Call parent function
  this.cache_.forEach(this.activateCacheItem_, this);
};


/**
 * Activates an image WMS layer cache item.
 * @param {olgm.herald.TileWMSSource.LayerCache} cacheItem
 * @private
 */
olgm.herald.TileWMSSource.prototype.activateCacheItem_ = function(
    cacheItem) {
  var layer = cacheItem.layer;
  var visible = layer.getVisible();
  if (visible && this.googleMapsIsActive) {
    cacheItem.layer.setOpacity(0);
  }
};


/**
 * Deactivate all cache items
 * @api
 */
olgm.herald.TileWMSSource.prototype.deactivate = function() {
  olgm.herald.TileWMSSource.base(this, 'deactivate'); //Call parent function
  this.cache_.forEach(this.deactivateCacheItem_, this);
};


/**
 * Deactivates a Tile WMS layer cache item.
 * @param {olgm.herald.TileWMSSource.LayerCache} cacheItem
 * @private
 */
olgm.herald.TileWMSSource.prototype.deactivateCacheItem_ = function(
    cacheItem) {
  cacheItem.layer.setOpacity(cacheItem.opacity);
};


/**
 * Deal with the google WMS layer when we enable or disable the OL3 WMS layer
 * @param {olgm.herald.TileWMSSource.LayerCache} cacheItem
 * @private
 */
olgm.herald.TileWMSSource.prototype.handleVisibleChange_ = function(
    cacheItem) {
  var layer = cacheItem.layer;
  var visible = layer.getVisible();

  var googleWMSLayer = cacheItem.googleWMSLayer;
  var googleMapsLayers = this.gmap.overlayMapTypes;

  // Get the position of the google layer so we can remove it
  var layerIndex = googleMapsLayers.getArray().indexOf(googleWMSLayer);

  if (visible) {
    // Add the google WMS layer only if it's not there already
    if (layerIndex == -1) {
      googleMapsLayers.push(googleWMSLayer);
    }
    this.activateCacheItem_(cacheItem);
  } else {
    // Remove the google WMS layer from the map if it hasn't been done already
    if (layerIndex != -1) {
      googleMapsLayers.removeAt(layerIndex);
    }
    this.deactivateCacheItem_(cacheItem);
  }
};


/**
 * @typedef {{
 *   googleWMSLayer: (google.maps.ImageMapType),
 *   layer: (ol.layer.Tile),
 *   listenerKeys: (Array.<ol.events.Key|Array.<ol.events.Key>>),
 *   opacity: (number)
 * }}
 */
olgm.herald.TileWMSSource.LayerCache;
