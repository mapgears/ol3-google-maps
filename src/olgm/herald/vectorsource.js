goog.provide('olgm.herald.VectorSource');

goog.require('ol');
goog.require('olgm');
goog.require('olgm.gm');
goog.require('olgm.herald.Source');
goog.require('olgm.herald.VectorFeature');


/**
 * Listen to a Vector layer
 * @param {!ol.Map} ol3map openlayers map
 * @param {!google.maps.Map} gmap google maps map
 * @param {olgmx.gm.MapIconOptions} mapIconOptions map icon options
 * @constructor
 * @extends {olgm.herald.Source}
 */
olgm.herald.VectorSource = function(ol3map, gmap, mapIconOptions) {
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

  /**
   * @type {olgmx.gm.MapIconOptions}
   * @private
   */
  this.mapIconOptions_ = mapIconOptions;

  olgm.herald.Source.call(this, ol3map, gmap);
};
ol.inherits(olgm.herald.VectorSource, olgm.herald.Source);


/**
 * @param {ol.layer.Base} layer layer to watch
 * @override
 */
olgm.herald.VectorSource.prototype.watchLayer = function(layer) {
  var vectorLayer = /** @type {ol.layer.Vector} */ (layer);

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
  var gmStyle = olgm.gm.createStyle(vectorLayer, this.mapIconOptions_);
  if (gmStyle) {
    data.setStyle(gmStyle);
  }

  // herald
  var herald = new olgm.herald.VectorFeature(
      this.ol3map, this.gmap, source, data, this.mapIconOptions_);

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

  var view = this.ol3map.getView();
  cacheItem.listenerKeys.push(view.on('change:resolution',
      this.handleResolutionChange_.bind(this, cacheItem), this));


  this.activateCacheItem_(cacheItem);

  this.cache_.push(cacheItem);
};


/**
 * Unwatch the vector layer
 * @param {ol.layer.Base} layer layer to unwatch
 * @override
 */
olgm.herald.VectorSource.prototype.unwatchLayer = function(layer) {
  var vectorLayer = /** @type {ol.layer.Vector} */ (layer);

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
 * @override
 */
olgm.herald.VectorSource.prototype.activate = function() {
  olgm.herald.Source.prototype.activate.call(this);
  this.cache_.forEach(this.activateCacheItem_, this);
};


/**
 * Activates an image WMS layer cache item.
 * @param {olgm.herald.VectorSource.LayerCache} cacheItem cacheItem to activate
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
 * @override
 */
olgm.herald.VectorSource.prototype.deactivate = function() {
  olgm.herald.Source.prototype.deactivate.call(this);
  this.cache_.forEach(this.deactivateCacheItem_, this);
};


/**
 * Deactivates a Tile WMS layer cache item.
 * @param {olgm.herald.VectorSource.LayerCache} cacheItem cacheItem to
 * deactivate
 * @private
 */
olgm.herald.VectorSource.prototype.deactivateCacheItem_ = function(
    cacheItem) {
  cacheItem.herald.deactivate();
  cacheItem.layer.setOpacity(cacheItem.opacity);
};


olgm.herald.VectorSource.prototype.handleResolutionChange_ = function(
    cacheItem) {
  var layer = cacheItem.layer;

  var minResolution = layer.getMinResolution();
  var maxResolution = layer.getMaxResolution();
  var currentResolution = this.ol3map.getView().getResolution();
  if (currentResolution < minResolution || currentResolution > maxResolution) {
    cacheItem.herald.setVisible(false);
  } else {
    cacheItem.herald.setVisible(true);
  }
};


/**
 * Deal with the google WMS layer when we enable or disable the OL3 WMS layer
 * @param {olgm.herald.VectorSource.LayerCache} cacheItem cacheItem for the
 * watched layer
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
 *   listenerKeys: (Array.<ol.EventsKey|Array.<ol.EventsKey>>),
 *   opacity: (number)
 * }}
 */
olgm.herald.VectorSource.LayerCache;
