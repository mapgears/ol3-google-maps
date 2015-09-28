goog.provide('olgm.LayersHerald');

goog.require('goog.asserts');
//goog.require('ol.layer.Base');
//goog.require('ol.layer.Vector');
goog.require('olgm.Herald');
goog.require('olgm.herald.VectorSource');



/**
 * The Layers Herald is responsible of listening to any vector layer added
 * to or removed from the ol3 map.
 *
 * If a `olgm.GoogleLayer` layer is added, the process of enabling the
 * Google Maps  map is activated (if it is the first). If there are already
 * existing `olgm.GoogleLayer` in the map, then the top-most is used to define
 * the map type id to use.
 *
 * If a `ol.layer.Vector` layer is added, then it is bound to a
 * `olgm.herald.VectorSource` to synchronize the vector features in it with
 * their equivalent in the Google Maps map. Also, the vector layer gets
 * rendered completely opaque to let Google Maps be 'master' of vector
 * features.
 *
 * @param {!ol.Map} ol3map
 * @param {!google.maps.Map} gmap
 * @constructor
 * @extends {olgm.Herald}
 * @api
 */
olgm.LayersHerald = function(ol3map, gmap) {

  /**
   * @type {Array.<olgm.LayersHerald.VectorLayerCache>}
   * @private
   */
  this.vectorCache_ = [];

  /**
   * @type {Array.<ol.layer.Vector>}
   * @private
   */
  this.vectorLayers_ = [];

  goog.base(this, ol3map, gmap);
};
goog.inherits(olgm.LayersHerald, olgm.Herald);


/**
 * @inheritDoc
 */
olgm.LayersHerald.prototype.activate = function() {
  goog.base(this, 'activate');

  // watch existing layers
  var layers = this.ol3map.getLayers();
  layers.forEach(function(layer) {
    this.watchLayer_(layer);
  }, this);

  // event listeners
  var keys = this.listenerKeys;
  keys.push(layers.on('add', this.handleLayersAdd_, this));
  keys.push(layers.on('remove', this.handleLayersRemove_, this));
};


/**
 * Callback method fired when a new layer is added to the map.
 * @param {ol.CollectionEvent} event Collection event.
 * @private
 */
olgm.LayersHerald.prototype.handleLayersAdd_ = function(event) {
  var layer = event.element;
  goog.asserts.assertInstanceof(layer, ol.layer.Base);
  this.watchLayer_(layer);
};


/**
 * Callback method fired when a layer is removed from the map.
 * @param {ol.CollectionEvent} event Collection event.
 * @private
 */
olgm.LayersHerald.prototype.handleLayersRemove_ = function(event) {
  var layer = event.element;
  goog.asserts.assertInstanceof(layer, ol.layer.Base);
  this.unwatchLayer_(layer);
};


/**
 * Watch the layer
 * @param {ol.layer.Base} layer
 * @private
 */
olgm.LayersHerald.prototype.watchLayer_ = function(layer) {
  // vector layer
  if (layer instanceof ol.layer.Vector) {
    this.vectorLayers_.push(layer);

    // a source is required to work with this layer
    var source = layer.getSource();
    if (!source) {
      return;
    }

    // herald
    var herald = new olgm.herald.VectorSource(this.ol3map, this.gmap, source);
    herald.activate();

    // opacity
    var opacity = layer.getOpacity();
    layer.setOpacity(0);

    this.vectorCache_.push({
      'herald': herald,
      'layer': layer,
      'opacity': opacity
    });
  }
};


/**
 * Unwatch the layer
 * @param {ol.layer.Base} layer
 * @private
 */
olgm.LayersHerald.prototype.unwatchLayer_ = function(layer) {
  // vector layer
  if (layer instanceof ol.layer.Vector) {
    var index = this.vectorLayers_.indexOf(layer);
    if (index !== -1) {
      this.vectorLayers_.splice(index, 1);

      var cacheItem = this.vectorCache_[index];

      // herald
      cacheItem.herald.deactivate();

      // opacity
      layer.setOpacity(cacheItem.opacity);

      this.vectorCache_.splice(index, 1);
    }
  }
};


/**
 * @typedef {{
 *   herald: (olgm.herald.VectorSource),
 *   layer: (ol.layer.Vector),
 *   opacity: (number)
 * }}
 */
olgm.LayersHerald.VectorLayerCache;
