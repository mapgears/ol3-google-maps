goog.provide('olgm.herald.VectorSource');

goog.require('olgm.herald.Source');
goog.require('olgm.herald.VectorFeature');



/**
 * Listen to a Vector layer
 * @param {!ol.Map} ol3map
 * @param {!google.maps.Map} gmap
 * @constructor
 * @extends {olgm.herald.Source}
 */
olgm.herald.VectorSource = function(ol3map, gmap) {
  /**
  * @type {Array.<olgm.herald.VectorSource.LayerCache>}
  * @private
  */
  this.cache_ = [];

  /**
  * @type {Array.<ol.layer.Vector>}
  * @private
  */
  this.layers_ = [];

  goog.base(this, ol3map, gmap);
};
goog.inherits(olgm.herald.VectorSource, olgm.herald.Source);


/**
 * @param {ol.layer.Base} layer
 * @override
 */
olgm.herald.VectorSource.prototype.watchLayer = function(layer) {
  var vectorLayer = /** {@type ol.layer.Vector} */ (layer);
  goog.asserts.assertInstanceof(vectorLayer, ol.layer.Vector);

  // Source required
  var source = vectorLayer.getSource();
  if (!source) {
    return;
  }

  this.layers_.push(vectorLayer);

  // Data
  var data = new google.maps.Data({
    'map': this.gmap
  });

  // Style
  var gmStyle = olgm.gm.createStyle(vectorLayer);
  if (gmStyle) {
    data.setStyle(gmStyle);
  }

  // herald
  var herald = new olgm.herald.VectorFeature(
      this.ol3map, this.gmap, source, data);

  // opacity
  var opacity = vectorLayer.getOpacity();

  var cacheItem = /** {@type olgm.herald.VectorSource.LayerCache} */ ({
    data: data,
    herald: herald,
    layer: vectorLayer,
    listenerKeys: [],
    opacity: opacity
  });

  cacheItem.listenerKeys.push(vectorLayer.on('change:visible',
      this.handleVisibleChange_.bind(this, cacheItem), this));

  this.activateCacheItem_(cacheItem);

  this.cache_.push(cacheItem);
};


/**
 * Unwatch the WMS tile layer
 * @param {ol.layer.Base} layer
 * @override
 */
olgm.herald.VectorSource.prototype.unwatchLayer = function(layer) {
  var vectorLayer = /** {@type ol.layer.Vector} */ (layer);
  goog.asserts.assertInstanceof(vectorLayer, ol.layer.Vector);

  var index = this.layers_.indexOf(vectorLayer);
  if (index !== -1) {
    this.layers_.splice(index, 1);

    var cacheItem = this.cache_[index];
    olgm.unlistenAllByKey(cacheItem.listenerKeys);

    // data - unset
    cacheItem.data.setMap(null);

    // herald
    cacheItem.herald.deactivate();

    // opacity
    vectorLayer.setOpacity(cacheItem.opacity);

    this.cache_.splice(index, 1);
  }

};


/**
 * Activate all cache items
 * @api
 */
olgm.herald.VectorSource.prototype.activate = function() {
  olgm.herald.VectorSource.base(this, 'activate'); // Call parent function
  this.cache_.forEach(this.activateCacheItem_, this);
};


/**
 * Activates an image WMS layer cache item.
 * @param {olgm.herald.VectorSource.LayerCache} cacheItem
 * @private
 */
olgm.herald.VectorSource.prototype.activateCacheItem_ = function(
    cacheItem) {
  var layer = cacheItem.layer;
  var visible = layer.getVisible();
  if (visible && this.googleMapsIsActive) {
    cacheItem.herald.activate();
    cacheItem.layer.setOpacity(0);
  }
};


/**
 * Deactivate all cache items
 * @api
 */
olgm.herald.VectorSource.prototype.deactivate = function() {
  olgm.herald.VectorSource.base(this, 'deactivate'); //Call parent function
  this.cache_.forEach(this.deactivateCacheItem_, this);
};


/**
 * Deactivates a Tile WMS layer cache item.
 * @param {olgm.herald.VectorSource.LayerCache} cacheItem
 * @private
 */
olgm.herald.VectorSource.prototype.deactivateCacheItem_ = function(
    cacheItem) {
  cacheItem.herald.deactivate();
  cacheItem.layer.setOpacity(cacheItem.opacity);
};


/**
 * Deal with the google WMS layer when we enable or disable the OL3 WMS layer
 * @param {olgm.herald.VectorSource.LayerCache} cacheItem
 * @private
 */
olgm.herald.VectorSource.prototype.handleVisibleChange_ = function(
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
 * @typedef {{
 *   data: (google.maps.Data),
 *   herald: (olgm.herald.VectorFeature),
 *   layer: (ol.layer.Vector),
 *   listenerKeys: (Array.<ol.events.Key|Array.<ol.events.Key>>),
 *   opacity: (number)
 * }}
 */
olgm.herald.VectorSource.LayerCache;
