/**
 * @module olgm/herald/VectorSource
 */
import {inherits} from 'ol/index.js';
import {unlistenAllByKey} from '../util.js';
import {createStyle} from '../gm.js';
import Source from './Source.js';
import VectorFeature from './VectorFeature.js';

/**
 * Listen to a Vector layer
 * @param {!ol.Map} ol3map openlayers map
 * @param {!google.maps.Map} gmap google maps map
 * @param {olgmx.gm.MapIconOptions} mapIconOptions map icon options
 * @constructor
 * @extends {olgm.herald.Source}
 */
const VectorSource = function(ol3map, gmap, mapIconOptions) {
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

  Source.call(this, ol3map, gmap);
};

inherits(VectorSource, Source);


/**
 * @param {ol.layer.Base} layer layer to watch
 * @override
 */
VectorSource.prototype.watchLayer = function(layer) {
  const vectorLayer = /** @type {ol.layer.Vector} */ (layer);

  // Source required
  const source = vectorLayer.getSource();
  if (!source) {
    return;
  }

  this.layers_.push(vectorLayer);

  // Data
  const data = new google.maps.Data({
    'map': this.gmap
  });

  // Style
  const gmStyle = createStyle(vectorLayer, this.mapIconOptions_);
  if (gmStyle) {
    data.setStyle(gmStyle);
  }

  // herald
  const herald = new VectorFeature(
    this.ol3map, this.gmap, source, data, this.mapIconOptions_);

  // opacity
  const opacity = vectorLayer.getOpacity();

  const cacheItem = /** {@type olgm.herald.VectorSource.LayerCache} */ ({
    data: data,
    herald: herald,
    layer: vectorLayer,
    listenerKeys: [],
    opacity: opacity
  });

  cacheItem.listenerKeys.push(vectorLayer.on('change:visible',
    this.handleVisibleChange_.bind(this, cacheItem), this));

  const view = this.ol3map.getView();
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
VectorSource.prototype.unwatchLayer = function(layer) {
  const vectorLayer = /** @type {ol.layer.Vector} */ (layer);

  const index = this.layers_.indexOf(vectorLayer);
  if (index !== -1) {
    this.layers_.splice(index, 1);

    const cacheItem = this.cache_[index];
    unlistenAllByKey(cacheItem.listenerKeys);

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
VectorSource.prototype.activate = function() {
  Source.prototype.activate.call(this);
  this.cache_.forEach(this.activateCacheItem_, this);
};


/**
 * Activates an image WMS layer cache item.
 * @param {olgm.herald.VectorSource.LayerCache} cacheItem cacheItem to activate
 * @private
 */
VectorSource.prototype.activateCacheItem_ = function(
  cacheItem) {
  const layer = cacheItem.layer;
  const visible = layer.getVisible();
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
VectorSource.prototype.deactivate = function() {
  Source.prototype.deactivate.call(this);
  this.cache_.forEach(this.deactivateCacheItem_, this);
};


/**
 * Deactivates a Tile WMS layer cache item.
 * @param {olgm.herald.VectorSource.LayerCache} cacheItem cacheItem to
 * deactivate
 * @private
 */
VectorSource.prototype.deactivateCacheItem_ = function(
  cacheItem) {
  cacheItem.herald.deactivate();
  cacheItem.layer.setOpacity(cacheItem.opacity);
};


VectorSource.prototype.handleResolutionChange_ = function(
  cacheItem) {
  const layer = cacheItem.layer;

  const minResolution = layer.getMinResolution();
  const maxResolution = layer.getMaxResolution();
  const currentResolution = this.ol3map.getView().getResolution();
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
VectorSource.prototype.handleVisibleChange_ = function(
  cacheItem) {
  const layer = cacheItem.layer;
  const visible = layer.getVisible();
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
VectorSource.LayerCache;
export default VectorSource;
