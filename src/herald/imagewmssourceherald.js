goog.provide('olgm.herald.ImageWMSSource');

goog.require('olgm.gm.ImageOverlay');
goog.require('olgm.herald.Source');



/**
 * Listen to a Image WMS layer
 * @param {!ol.Map} ol3map
 * @param {!google.maps.Map} gmap
 * @constructor
 * @extends {olgm.herald.Source}
 */
olgm.herald.ImageWMSSource = function(ol3map, gmap) {
  /**
  * @type {Array.<olgm.herald.ImageWMSSource.LayerCache>}
  * @private
  */
  this.cache_ = [];

  /**
  * @type {Array.<ol.layer.Image>}
  * @private
  */
  this.layers_ = [];

  goog.base(this, ol3map, gmap);
};
goog.inherits(olgm.herald.ImageWMSSource, olgm.herald.Source);


/**
 * @param {ol.layer.Base} layer
 * @override
 */
olgm.herald.ImageWMSSource.prototype.watchLayer = function(layer) {
  var imageLayer = /** {@type ol.layer.Image} */ (layer);
  goog.asserts.assertInstanceof(imageLayer, ol.layer.Image);

  var source = imageLayer.getSource();
  if (!source) {
    return;
  }

  this.layers_.push(imageLayer);

  // opacity
  var opacity = layer.getOpacity();

  var cacheItem = /** {@type olgm.herald.ImageWMSSource.LayerCache} */ ({
    imageOverlay: null,
    lastUrl: null,
    layer: imageLayer,
    listenerKeys: [],
    opacity: opacity
  });

  // Hide the google layer when the ol3 layer is invisible
  cacheItem.listenerKeys.push(layer.on('change:visible',
      this.handleVisibleChange_.bind(this, cacheItem), this));

  cacheItem.listenerKeys.push(this.ol3map.on('moveend',
      this.handleMoveEnd_.bind(this, cacheItem), this));

  cacheItem.listenerKeys.push(this.ol3map.getView().on('change:resolution',
      this.handleMoveEnd_.bind(this, cacheItem), this));

  // Activate the cache item
  this.activateCacheItem_(cacheItem);
  this.cache_.push(cacheItem);
};


/**
 * Unwatch the WMS Image layer
 * @param {ol.layer.Base} layer
 * @override
 */
olgm.herald.ImageWMSSource.prototype.unwatchLayer = function(layer) {
  goog.asserts.assertInstanceof(layer, ol.layer.Image);
  var index = this.layers_.indexOf(layer);
  if (index !== -1) {
    this.layers_.splice(index, 1);

    var cacheItem = this.cache_[index];
    olgm.unlistenAllByKey(cacheItem.listenerKeys);

    // opacity
    layer.setOpacity(cacheItem.opacity);

    this.cache_.splice(index, 1);
  }
};


/**
 * Activate all cache items
 * @override
 */
olgm.herald.ImageWMSSource.prototype.activate = function() {
  olgm.herald.ImageWMSSource.base(this, 'activate'); // Call parent function
  this.cache_.forEach(this.activateCacheItem_, this);
};


/**
 * Activates an image WMS layer cache item.
 * @param {olgm.herald.ImageWMSSource.LayerCache} cacheItem
 * @private
 */
olgm.herald.ImageWMSSource.prototype.activateCacheItem_ = function(
    cacheItem) {
  var layer = cacheItem.layer;
  var visible = layer.getVisible();
  if (visible && this.googleMapsIsActive) {
    cacheItem.lastUrl = null;
    cacheItem.layer.setOpacity(0);
    this.updateImageOverlay_(cacheItem);
  }
};


/**
 * Deactivate all cache items
 * @override
 */
olgm.herald.ImageWMSSource.prototype.deactivate = function() {
  olgm.herald.ImageWMSSource.base(this, 'deactivate'); //Call parent function
  this.cache_.forEach(this.deactivateCacheItem_, this);
};


/**
 * Deactivates an Image WMS layer cache item.
 * @param {olgm.herald.ImageWMSSource.LayerCache} cacheItem
 * @private
 */
olgm.herald.ImageWMSSource.prototype.deactivateCacheItem_ = function(
    cacheItem) {
  if (cacheItem.imageOverlay) {
    cacheItem.imageOverlay.setMap(null);
    cacheItem.imageOverlay = null;
  }
  cacheItem.layer.setOpacity(cacheItem.opacity);
};


/**
 * Generate a wms request url for a single image
 * @param {ol.layer.Image} layer
 * @return {string}
 * @private
 */
olgm.herald.ImageWMSSource.prototype.generateImageWMSFunction_ = function(
    layer) {
  var source = layer.getSource();
  goog.asserts.assertInstanceof(source, ol.source.ImageWMS);

  var params = source.getParams();
  var ol3map = this.ol3map;

  //base WMS URL
  var url = source.getUrl();
  var size = ol3map.getSize();

  goog.asserts.assert(size !== undefined);

  var view = ol3map.getView();
  var bbox = view.calculateExtent(size);

  // Get params
  var version = params['VERSION'] ? params['VERSION'] : '1.3.0';
  var layers = params['LAYERS'] ? params['LAYERS'] : '';
  var styles = params['STYLES'] ? params['STYLES'] : '';
  var format = params['FORMAT'] ? params['FORMAT'] : 'image/png';
  var transparent = params['TRANSPARENT'] ? params['TRANSPARENT'] : 'TRUE';
  var tiled = params['TILED'] ? params['TILED'] : 'FALSE';

  url += '?SERVICE=WMS';
  url += '&VERSION=' + version;
  url += '&REQUEST=GetMap';
  url += '&LAYERS=' + layers;
  url += '&STYLES=' + styles;
  url += '&FORMAT=' + format;
  url += '&TRANSPARENT=' + transparent;
  url += '&SRS=EPSG:3857';
  url += '&BBOX=' + bbox;
  url += '&WIDTH=' + size[0];
  url += '&HEIGHT=' + size[1];
  url += '&TILED=' + tiled;

  return url;
};


/**
 * Refresh the custom image overlay on google maps
 * @param {olgm.herald.ImageWMSSource.LayerCache} cacheItem
 * @private
 */
olgm.herald.ImageWMSSource.prototype.updateImageOverlay_ = function(cacheItem) {
  var layer = cacheItem.layer;
  var url = this.generateImageWMSFunction_(layer);

  /* We listen to both change:resolution and moveend events. However, changing
   * resolution eventually sends a moveend event as well. Using only the
   * moveend event makes zooming in/out look bad. To prevent rendering the
   * overlay twice when it happens, we save the request url, and if it's the
   * same as the last time, we don't render it.
   */
  if (url == cacheItem.lastUrl) {
    return;
  }

  cacheItem.lastUrl = url;

  // Create a new overlay
  var view = this.ol3map.getView();
  var size = this.ol3map.getSize();

  goog.asserts.assert(size !== undefined);

  var extent = view.calculateExtent(size);

  // First, get the coordinates of the top left corner
  var topLeft = ol.extent.getTopLeft(extent);

  // Then, convert it to LatLng coordinates for google
  var lngLat = ol.proj.transform(topLeft, 'EPSG:3857', 'EPSG:4326');
  var topLeftLatLng = new google.maps.LatLng(lngLat[1], lngLat[0]);

  var overlay = new olgm.gm.ImageOverlay(
      url,
      size,
      topLeftLatLng);

  // Set the new overlay right away to give it time to render
  overlay.setMap(this.gmap);

  // Clean previous overlay
  if (cacheItem.imageOverlay) {
    // Remove the overlay from the map
    cacheItem.imageOverlay.setMap(null);

    // Destroy the overlay
    cacheItem.imageOverlay = null;
  }

  // Save new overlay
  cacheItem.imageOverlay = overlay;
};


/**
 * Deal with the google WMS layer when we enable or disable the OL3 WMS layer
 * @param {olgm.herald.ImageWMSSource.LayerCache} cacheItem
 * @private
 */
olgm.herald.ImageWMSSource.prototype.handleVisibleChange_ = function(
    cacheItem) {
  var layer = cacheItem.layer;
  var visible = layer.getVisible();

  if (visible) {
    this.activateCacheItem_(cacheItem);
  } else {
    this.deactivateCacheItem_(cacheItem);
  }
};


/**
 * Handle the map being panned when an ImageWMS layer is present
 * @param {olgm.herald.ImageWMSSource.LayerCache} cacheItem
 * @private
 */
olgm.herald.ImageWMSSource.prototype.handleMoveEnd_ = function(
    cacheItem) {
  if (cacheItem.layer.getVisible()) {
    this.updateImageOverlay_(cacheItem);
  }
};


/**
 * @typedef {{
 *   imageOverlay: (olgm.gm.ImageOverlay),
 *   lastUrl: (string|null),
 *   layer: (ol.layer.Image),
 *   listenerKeys: (Array.<ol.events.Key|Array.<ol.events.Key>>),
 *   opacity: (number)
 * }}
 */
olgm.herald.ImageWMSSource.LayerCache;
