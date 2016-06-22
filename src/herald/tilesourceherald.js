goog.provide('olgm.herald.TileSource');

goog.require('olgm.herald.Source');



/**
 * Listen to a tiled layer
 * @param {!ol.Map} ol3map
 * @param {!google.maps.Map} gmap
 * @constructor
 * @extends {olgm.herald.Source}
 */
olgm.herald.TileSource = function(ol3map, gmap) {
  /**
  * @type {Array.<olgm.herald.TileSource.LayerCache>}
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
goog.inherits(olgm.herald.TileSource, olgm.herald.Source);


/**
 * @param {ol.layer.Base} layer
 * @override
 */
olgm.herald.TileSource.prototype.watchLayer = function(layer) {
  var tileLayer = /** {@type ol.layer.Tile} */ (layer);
  goog.asserts.assertInstanceof(tileLayer, ol.layer.Tile);

  // Source required
  var source = tileLayer.getSource();
  if (!source) {
    return;
  }

  this.layers_.push(tileLayer);

  // opacity
  var opacity = tileLayer.getOpacity();

  var cacheItem = /** {@type olgm.herald.TileSource.LayerCache} */ ({
    layer: tileLayer,
    listenerKeys: [],
    opacity: opacity
  });

  var tileSize = new google.maps.Size(256, 256);

  var options = {
    'getTileUrl': this.googleGetTileUrlFunction_.bind(this, tileLayer),
    'tileSize': tileSize,
    'isPng': true,
    'opacity': opacity
  };

  // Create the tiled layer on the google layer
  var googleTileLayer = new google.maps.ImageMapType(options);
  if (tileLayer.getVisible()) {
    this.gmap.overlayMapTypes.push(googleTileLayer);
  }
  cacheItem.googleTileLayer = googleTileLayer;

  // Hide the google layer when the ol3 layer is invisible
  cacheItem.listenerKeys.push(tileLayer.on('change:visible',
      this.handleVisibleChange_.bind(this, cacheItem), this));

  // Activate the cache item
  this.activateCacheItem_(cacheItem);
  this.cache_.push(cacheItem);
};


/**
 * This function is used by google maps to get the url for a tile at the given
 * coordinates and zoom level
 * @param {ol.layer.Tile} tileLayer
 * @param {google.maps.Point} coords
 * @param {Number} zoom
 * @return {string|undefined}
 * @private
 */
olgm.herald.TileSource.prototype.googleGetTileUrlFunction_ = function(
    tileLayer, coords, zoom) {
  var source = tileLayer.getSource();
  goog.asserts.assertInstanceof(source, ol.source.TileImage);

  // Get a few variables from the source object
  var getTileUrlFunction = source.getTileUrlFunction();
  var proj = ol.proj.get('EPSG:3857');
  var tileGrid = source.getTileGrid();

  // Convert the coords from google maps to ol3 tile format
  var ol3Coords = [zoom, coords.x, (-coords.y) - 1];

  // Save the extent for this layer, default to the one for the projection
  var extent = tileLayer.getExtent();
  if (!extent) {
    extent = proj.getExtent();
  }

  /* Google Maps checks for tiles which might not exist, for example tiles
   * above the world map. We need to filter out these to avoid invalid
   * requests.
   */
  if (tileGrid) {
    /* Get the intersection area between the wanted tile's extent and the
     * layer's extent. If that intersection has an area smaller than 1, it
     * means it's not part of the map. We do this because a tile directly
     * above the map but not inside it still counts as an intersection, but
     * with a size of 0.
     */
    var intersection = ol.extent.getIntersection(
        extent, tileGrid.getTileCoordExtent(ol3Coords));
    var intersectionSize = ol.extent.getSize(intersection);
    var intersectionArea = intersectionSize[0] * intersectionSize[1];

    if (intersectionArea < 1 || intersectionArea == Infinity) {
      return;
    }
  }

  var result = getTileUrlFunction(ol3Coords, 1, proj);

  // TileJSON sources don't have their url function right away, try again
  if (result === undefined) {
    goog.asserts.assertInstanceof(source, ol.source.TileImage);
    getTileUrlFunction = source.getTileUrlFunction();
    result = getTileUrlFunction(ol3Coords, 1, proj);
  }

  return result;
};


/**
 * Unwatch the tile layer
 * @param {ol.layer.Base} layer
 * @override
 */
olgm.herald.TileSource.prototype.unwatchLayer = function(layer) {
  var tileLayer = /** {@type ol.layer.Tile} */ (layer);
  goog.asserts.assertInstanceof(tileLayer, ol.layer.Tile);

  var index = this.layers_.indexOf(tileLayer);
  if (index !== -1) {
    this.layers_.splice(index, 1);

    var cacheItem = this.cache_[index];
    olgm.unlistenAllByKey(cacheItem.listenerKeys);

    // Remove the layer from google maps
    var googleTileLayer = cacheItem.googleTileLayer;
    var googleMapsLayers = this.gmap.overlayMapTypes;

    // Get the position of the google layer so we can remove it
    var layerIndex = googleMapsLayers.getArray().indexOf(googleTileLayer);
    if (layerIndex != -1) {
      googleMapsLayers.removeAt(layerIndex);
    }

    // opacity
    tileLayer.setOpacity(cacheItem.opacity);

    this.cache_.splice(index, 1);
  }
};


/**
 * Activate all cache items
 * @api
 */
olgm.herald.TileSource.prototype.activate = function() {
  olgm.herald.TileSource.base(this, 'activate'); // Call parent function
  this.cache_.forEach(this.activateCacheItem_, this);
};


/**
 * Activates an tile layer cache item.
 * @param {olgm.herald.TileSource.LayerCache} cacheItem
 * @private
 */
olgm.herald.TileSource.prototype.activateCacheItem_ = function(
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
olgm.herald.TileSource.prototype.deactivate = function() {
  olgm.herald.TileSource.base(this, 'deactivate'); //Call parent function
  this.cache_.forEach(this.deactivateCacheItem_, this);
};


/**
 * Deactivates a Tile layer cache item.
 * @param {olgm.herald.TileSource.LayerCache} cacheItem
 * @private
 */
olgm.herald.TileSource.prototype.deactivateCacheItem_ = function(
    cacheItem) {
  cacheItem.layer.setOpacity(cacheItem.opacity);
};


/**
 * Deal with the google tile layer when we enable or disable the OL3 tile layer
 * @param {olgm.herald.TileSource.LayerCache} cacheItem
 * @private
 */
olgm.herald.TileSource.prototype.handleVisibleChange_ = function(
    cacheItem) {
  var layer = cacheItem.layer;
  var visible = layer.getVisible();

  var googleTileLayer = cacheItem.googleTileLayer;
  var googleMapsLayers = this.gmap.overlayMapTypes;

  // Get the position of the google layer so we can remove it
  var layerIndex = googleMapsLayers.getArray().indexOf(googleTileLayer);

  if (visible) {
    // Add the google tile layer only if it's not there already
    if (layerIndex == -1) {
      googleMapsLayers.push(googleTileLayer);
    }
    this.activateCacheItem_(cacheItem);
  } else {
    // Remove the google tile layer from the map if it hasn't been done already
    if (layerIndex != -1) {
      googleMapsLayers.removeAt(layerIndex);
    }
    this.deactivateCacheItem_(cacheItem);
  }
};


/**
 * @typedef {{
 *   googleTileLayer: (google.maps.ImageMapType),
 *   layer: (ol.layer.Tile),
 *   listenerKeys: (Array.<ol.events.Key|Array.<ol.events.Key>>),
 *   opacity: (number)
 * }}
 */
olgm.herald.TileSource.LayerCache;
