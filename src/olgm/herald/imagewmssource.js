goog.provide('olgm.herald.ImageWMSSource');

goog.require('ol');
goog.require('ol.extent');
goog.require('ol.proj');
goog.require('ol.source.ImageWMS');
goog.require('olgm');
goog.require('olgm.asserts');
goog.require('olgm.gm.ImageOverlay');
goog.require('olgm.herald.Source');


/**
 * Listen to a Image WMS layer
 * @param {!ol.Map} ol3map openlayers map
 * @param {!google.maps.Map} gmap google maps map
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

  olgm.herald.Source.call(this, ol3map, gmap);
};
ol.inherits(olgm.herald.ImageWMSSource, olgm.herald.Source);


/**
 * @param {ol.layer.Base} layer layer to watch
 * @override
 */
olgm.herald.ImageWMSSource.prototype.watchLayer = function(layer) {
  var imageLayer = /** @type {ol.layer.Image} */ (layer);

  // Source must be ImageWMS
  var source = imageLayer.getSource();
  if (!(source instanceof ol.source.ImageWMS)) {
    return;
  }

  this.layers_.push(imageLayer);

  // opacity
  var opacity = imageLayer.getOpacity();

  var cacheItem = /** {@type olgm.herald.ImageWMSSource.LayerCache} */ ({
    imageOverlay: null,
    lastUrl: null,
    layer: imageLayer,
    listenerKeys: [],
    opacity: opacity,
    zIndex: 0
  });

  // Hide the google layer when the ol3 layer is invisible
  cacheItem.listenerKeys.push(imageLayer.on('change:visible',
      this.handleVisibleChange_.bind(this, cacheItem), this));

  cacheItem.listenerKeys.push(this.ol3map.on('moveend',
      this.handleMoveEnd_.bind(this, cacheItem), this));

  cacheItem.listenerKeys.push(this.ol3map.getView().on('change:resolution',
      this.handleMoveEnd_.bind(this, cacheItem), this));

  // Make sure that any change to the layer source itself also updates the
  // google maps layer
  cacheItem.listenerKeys.push(imageLayer.getSource().on('change',
      this.handleMoveEnd_.bind(this, cacheItem), this));

  // Activate the cache item
  this.activateCacheItem_(cacheItem);
  this.cache_.push(cacheItem);
};


/**
 * Unwatch the WMS Image layer
 * @param {ol.layer.Base} layer layer to unwatch
 * @override
 */
olgm.herald.ImageWMSSource.prototype.unwatchLayer = function(layer) {
  var imageLayer = /** @type {ol.layer.Image} */ (layer);

  var index = this.layers_.indexOf(imageLayer);
  if (index !== -1) {
    this.layers_.splice(index, 1);

    var cacheItem = this.cache_[index];
    olgm.unlistenAllByKey(cacheItem.listenerKeys);

    // Clean previous overlay
    this.resetImageOverlay_(cacheItem);

    // opacity
    imageLayer.setOpacity(cacheItem.opacity);

    this.cache_.splice(index, 1);
  }
};


/**
 * Activate all cache items
 * @override
 */
olgm.herald.ImageWMSSource.prototype.activate = function() {
  olgm.herald.Source.prototype.activate.call(this);
  this.cache_.forEach(this.activateCacheItem_, this);
};


/**
 * Activates an image WMS layer cache item.
 * @param {olgm.herald.ImageWMSSource.LayerCache} cacheItem cacheItem to
 * activate
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
  olgm.herald.Source.prototype.deactivate.call(this);
  this.cache_.forEach(this.deactivateCacheItem_, this);
};


/**
 * Deactivates an Image WMS layer cache item.
 * @param {olgm.herald.ImageWMSSource.LayerCache} cacheItem cacheItem to
 * deactivate
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
 * @param {ol.layer.Image} layer layer to query
 * @return {string} url to the requested tile
 * @private
 */
olgm.herald.ImageWMSSource.prototype.generateImageWMSFunction_ = function(
    layer) {
  var key;
  var source = /** @type {ol.source.ImageWMS} */ (layer.getSource());

  var params = source.getParams();
  var ol3map = this.ol3map;

  //base WMS URL
  var url = source.getUrl();
  var size = ol3map.getSize();

  olgm.asserts.assert(
      size !== undefined, 'Expected the map to have a size');

  var view = ol3map.getView();
  var bbox = view.calculateExtent(size);

  // Separate original WMS params and custom ones
  var wmsParamsList = [
    'CRS',
    'BBOX',
    'FORMAT',
    'HEIGHT',
    'LAYERS',
    'REQUEST',
    'SERVICE',
    'SRS',
    'STYLES',
    'TILED',
    'TRANSPARENT',
    'VERSION',
    'WIDTH'
  ];
  var customParams = {};
  var wmsParams = {};
  for (key in params) {
    var upperCaseKey = key.toUpperCase();
    if (wmsParamsList.indexOf(upperCaseKey) === -1) {
      if (params[key] !== undefined && params[key] !== null) {
        customParams[key] = params[key];
      }
    } else {
      wmsParams[upperCaseKey] = params[key];
    }
  }

  // Set WMS params
  var version = wmsParams['VERSION'] ? wmsParams['VERSION'] : '1.3.0';
  var layers = wmsParams['LAYERS'] ? wmsParams['LAYERS'] : '';
  var styles = wmsParams['STYLES'] ? wmsParams['STYLES'] : '';
  var format = wmsParams['FORMAT'] ? wmsParams['FORMAT'] : 'image/png';
  var transparent = wmsParams['TRANSPARENT'] ?
    wmsParams['TRANSPARENT'] : 'TRUE';
  var tiled = wmsParams['TILED'] ? wmsParams['TILED'] : 'FALSE';

  // Check whether or not we're using WMS 1.3.0
  var versionNumbers = version.split('.');
  var wms13 = (
    parseInt(versionNumbers[0], 10) >= 1 &&
    parseInt(versionNumbers[1], 10) >= 3);
  var referenceSystem = wms13 ? 'CRS' : 'SRS';

  url += '?SERVICE=WMS';
  url += '&VERSION=' + version;
  url += '&REQUEST=GetMap';
  url += '&LAYERS=' + layers;
  url += '&STYLES=' + styles;
  url += '&FORMAT=' + format;
  url += '&TRANSPARENT=' + transparent;
  url += '&' + referenceSystem + '=EPSG:3857';
  url += '&BBOX=' + bbox;
  url += '&WIDTH=' + size[0];
  url += '&HEIGHT=' + size[1];
  url += '&TILED=' + tiled;

  // Set Custom params
  for (key in customParams) {
    url += '&' + key + '=' + customParams[key];
  }

  return url;
};


/**
 * Clean-up the image overlay
 * @param {olgm.herald.ImageWMSSource.LayerCache} cacheItem cacheItem
 * @private
 */
olgm.herald.ImageWMSSource.prototype.resetImageOverlay_ = function(cacheItem) {
  // Clean previous overlay
  if (cacheItem.imageOverlay) {
    // Remove the overlay from the map
    cacheItem.imageOverlay.setMap(null);

    // Destroy the overlay
    cacheItem.imageOverlay = null;
  }
};


/**
 * Refresh the custom image overlay on google maps
 * @param {olgm.herald.ImageWMSSource.LayerCache} cacheItem cacheItem for the
 * layer to update
 * @param {boolean=} opt_force whether we should refresh even if the
 * url for the request hasn't changed. Defaults to false.
 * @private
 */
olgm.herald.ImageWMSSource.prototype.updateImageOverlay_ = function(
    cacheItem, opt_force) {
  var layer = cacheItem.layer;

  if (!layer.getVisible()) {
    return;
  }

  var url = this.generateImageWMSFunction_(layer);
  var forceRefresh = opt_force == true;

  // Force a refresh by setting a new url
  if (forceRefresh) {
    url += '&timestamp=' + new Date().getTime();
  }

  // Check if we're within the accepted resolutions
  var minResolution = layer.getMinResolution();
  var maxResolution = layer.getMaxResolution();
  var currentResolution = this.ol3map.getView().getResolution();
  if (currentResolution < minResolution || currentResolution > maxResolution) {
    this.resetImageOverlay_(cacheItem);
    return;
  }

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

  olgm.asserts.assert(
      size !== undefined, 'Expected the map to have a size');

  var extent = view.calculateExtent(size);

  // First, get the coordinates of the top left corner
  var topLeft = ol.extent.getTopLeft(extent);

  // Then, convert it to LatLng coordinates for google
  var lngLat = ol.proj.transform(topLeft, 'EPSG:3857', 'EPSG:4326');
  var topLeftLatLng = new google.maps.LatLng(lngLat[1], lngLat[0]);

  var overlay = new olgm.gm.ImageOverlay(
      url,
      /** @type {Array<number>} */ (size),
      topLeftLatLng);
  overlay.setZIndex(cacheItem.zIndex);

  // Set the new overlay right away to give it time to render
  overlay.setMap(this.gmap);

  // Clean previous overlay
  this.resetImageOverlay_(cacheItem);

  // Save new overlay
  cacheItem.imageOverlay = overlay;
};


/**
 * Order the layers by index in the ol3 layers array
 * @api
 */
olgm.herald.ImageWMSSource.prototype.orderLayers = function() {
  for (var i = 0; i < this.cache_.length; i++) {
    var cacheItem = this.cache_[i];
    var layer = cacheItem.layer;
    var zIndex = this.findIndex(layer);
    cacheItem.zIndex = zIndex;

    // There won't be an imageOverlay while Google Maps isn't visible
    if (cacheItem.imageOverlay) {
      cacheItem.imageOverlay.setZIndex(zIndex);
    }
  }
};


/**
 * Refresh the image overlay for each cache item
 * @api
 */
olgm.herald.ImageWMSSource.prototype.refresh = function() {
  for (var i = 0; i < this.cache_.length; i++) {
    this.updateImageOverlay_(this.cache_[i], true);
  }
};


/**
 * Deal with the google WMS layer when we enable or disable the OL3 WMS layer
 * @param {olgm.herald.ImageWMSSource.LayerCache} cacheItem cacheItem for the
 * watched layer
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
 * @param {olgm.herald.ImageWMSSource.LayerCache} cacheItem cacheItem for the
 * watched layer
 * @private
 */
olgm.herald.ImageWMSSource.prototype.handleMoveEnd_ = function(
    cacheItem) {
  if (cacheItem.layer.getVisible() && this.ol3map.getView().getCenter()) {
    this.updateImageOverlay_(cacheItem);
  }
};


/**
 * @typedef {{
 *   imageOverlay: (olgm.gm.ImageOverlay),
 *   lastUrl: (string|null),
 *   layer: (ol.layer.Image),
 *   listenerKeys: (Array.<ol.EventsKey|Array.<ol.EventsKey>>),
 *   opacity: (number),
 *   zIndex: (number)
 * }}
 */
olgm.herald.ImageWMSSource.LayerCache;
