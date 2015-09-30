goog.provide('olgm.herald.Layers');

goog.require('goog.asserts');
//goog.require('ol.layer.Base');
//goog.require('ol.layer.Vector');
goog.require('olgm.herald.Herald');
goog.require('olgm.herald.VectorSource');
goog.require('olgm.herald.View');
goog.require('olgm.layer.Google');



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
 * @extends {olgm.herald.Herald}
 * @api
 */
olgm.herald.Layers = function(ol3map, gmap) {

  /**
   * @type {Array.<olgm.layer.Google>}
   * @private
   */
  this.googleLayers_ = [];

  /**
   * @type {Array.<olgm.herald.Layers.GoogleLayerCache>}
   * @private
   */
  this.googleCache_ = [];

  /**
   * @type {Array.<olgm.herald.Layers.VectorLayerCache>}
   * @private
   */
  this.vectorCache_ = [];

  /**
   * @type {Array.<ol.layer.Vector>}
   * @private
   */
  this.vectorLayers_ = [];

  /**
   * @type {olgm.herald.View}
   * @private
   */
  this.viewHerald_ = new olgm.herald.View(ol3map, gmap);


  // === Elements  === //

  /**
   * @type {Node}
   * @private
   */
  this.gmapEl_ = gmap.getDiv();

  /**
   * @type {Element}
   * @private
   */
  this.ol3mapEl_ = ol3map.getViewport();

  /**
   * @type {Element}
   * @private
   */
  this.targetEl_ = ol3map.getTargetElement();


  goog.base(this, ol3map, gmap);
};
goog.inherits(olgm.herald.Layers, olgm.herald.Herald);


/**
 * Flag that determines whether the GoogleMaps map is currently active, i.e.
 * is currently shown and has the OpenLayers map added as one of its control.
 * @type {boolean}
 * @private
 */
olgm.herald.Layers.prototype.googleMapsIsActive_ = false;


/**
 * @inheritDoc
 */
olgm.herald.Layers.prototype.activate = function() {
  goog.base(this, 'activate');

  var layers = this.ol3map.getLayers();

  // watch existing layers
  layers.forEach(this.watchLayer_, this);

  // event listeners
  var keys = this.listenerKeys;
  keys.push(layers.on('add', this.handleLayersAdd_, this));
  keys.push(layers.on('remove', this.handleLayersRemove_, this));
};


/**
 * @inheritDoc
 */
olgm.herald.Layers.prototype.deactivate = function() {
  // unwatch existing layers
  this.ol3map.getLayers().forEach(this.unwatchLayer_, this);

  goog.base(this, 'deactivate');
};


/**
 * Callback method fired when a new layer is added to the map.
 * @param {ol.CollectionEvent} event Collection event.
 * @private
 */
olgm.herald.Layers.prototype.handleLayersAdd_ = function(event) {
  var layer = event.element;
  goog.asserts.assertInstanceof(layer, ol.layer.Base);
  this.watchLayer_(layer);
};


/**
 * Callback method fired when a layer is removed from the map.
 * @param {ol.CollectionEvent} event Collection event.
 * @private
 */
olgm.herald.Layers.prototype.handleLayersRemove_ = function(event) {
  var layer = event.element;
  goog.asserts.assertInstanceof(layer, ol.layer.Base);
  this.unwatchLayer_(layer);
};


/**
 * Watch the layer
 * @param {ol.layer.Base} layer
 * @private
 */
olgm.herald.Layers.prototype.watchLayer_ = function(layer) {
  if (layer instanceof olgm.layer.Google) {
    this.watchGoogleLayer_(layer);
  } else if (layer instanceof ol.layer.Vector) {
    this.watchVectorLayer_(layer);
  }
};


/**
 * Watch the google layer
 * @param {olgm.layer.Google} layer
 * @private
 */
olgm.herald.Layers.prototype.watchGoogleLayer_ = function(layer) {
  this.googleLayers_.push(layer);
  this.googleCache_.push(/** @type {olgm.herald.Layers.GoogleLayerCache} */ ({
    layer: layer,
    listenerKeys: [
      layer.on('change:visible', this.toggleGoogleMaps_, this)
    ]
  }));
  this.toggleGoogleMaps_();
};


/**
 * Watch the vector layer
 * @param {ol.layer.Vector} layer
 * @private
 */
olgm.herald.Layers.prototype.watchVectorLayer_ = function(layer) {

  var ol3map = this.ol3map;
  var gmap = this.gmap;

  // a source is required to work with this layer
  var source = layer.getSource();
  if (!source) {
    return;
  }

  this.vectorLayers_.push(layer);

  // Data
  var data = new google.maps.Data({
    'map': gmap
  });

  // herald
  var herald = new olgm.herald.VectorSource(ol3map, gmap, source, data);
  herald.activate();

  // opacity
  var opacity = layer.getOpacity();
  layer.setOpacity(0);

  this.vectorCache_.push(/** {@type olgm.herald.Layers.VectorLayerCache} */ ({
    data: data,
    herald: herald,
    layer: layer,
    opacity: opacity
  }));
};


/**
 * Unwatch the layer
 * @param {ol.layer.Base} layer
 * @private
 */
olgm.herald.Layers.prototype.unwatchLayer_ = function(layer) {
  if (layer instanceof olgm.layer.Google) {
    this.unwatchGoogleLayer_(layer);
  } else if (layer instanceof ol.layer.Vector) {
    this.unwatchVectorLayer_(layer);
  }
};


/**
 * Unwatch the google layer
 * @param {olgm.layer.Google} layer
 * @private
 */
olgm.herald.Layers.prototype.unwatchGoogleLayer_ = function(layer) {
  var index = this.googleLayers_.indexOf(layer);
  if (index !== -1) {
    this.googleLayers_.splice(index, 1);

    var cacheItem = this.googleCache_[index];
    olgm.unlistenAllByKey(cacheItem.listenerKeys);

    this.googleCache_.splice(index, 1);

    this.toggleGoogleMaps_();
  }
};


/**
 * Unwatch the vector layer
 * @param {ol.layer.Vector} layer
 * @private
 */
olgm.herald.Layers.prototype.unwatchVectorLayer_ = function(layer) {
  var index = this.vectorLayers_.indexOf(layer);
  if (index !== -1) {
    this.vectorLayers_.splice(index, 1);

    var cacheItem = this.vectorCache_[index];

    // data - unset
    cacheItem.data.setMap(null);

    // herald
    cacheItem.herald.deactivate();

    // opacity
    layer.setOpacity(cacheItem.opacity);

    this.vectorCache_.splice(index, 1);
  }
};


/**
 * Activates the GoogleMaps map, i.e. put it in the ol3 map target and put
 * the ol3 map inside the gmap controls.
 * @private
 */
olgm.herald.Layers.prototype.activateGoogleMaps_ = function() {

  if (this.googleMapsIsActive_) {
    return;
  }

  this.targetEl_.appendChild(this.gmapEl_);
  this.ol3mapEl_.remove();
  this.gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(
      this.ol3mapEl_);

  this.vectorCache_.forEach(function(item, index) {
    item.layer.setOpacity(0);
  }, this);

  this.viewHerald_.activate();

  // the map div of GoogleMaps doesn't like being tossed aroud. The line
  // below fixes the UI issue of wrong size of the tiles of GoogleMaps
  google.maps.event.trigger(this.gmap, 'resize');

  // it's also possible that the google maps map is not exactly at the
  // correct location. Fix this manually here
  this.viewHerald_.setCenter();
  this.viewHerald_.setZoom();

  this.googleMapsIsActive_ = true;
};


/**
 * Deactivates the GoogleMaps map, i.e. put the ol3 map back in its target
 * and remove the gmap map.
 * @private
 */
olgm.herald.Layers.prototype.deactivateGoogleMaps_ = function() {

  if (!this.googleMapsIsActive_) {
    return;
  }

  this.gmap.controls[google.maps.ControlPosition.TOP_LEFT].removeAt(0);
  this.targetEl_.appendChild(this.ol3mapEl_);
  this.gmapEl_.remove();

  this.viewHerald_.deactivate();

  this.vectorCache_.forEach(function(item, index) {
    item.layer.setOpacity(item.opacity);
  }, this);

  this.ol3mapEl_.style.position = 'relative';

  this.googleMapsIsActive_ = false;
};


/**
 * This method takes care of activating or deactivating the GoogleMaps map.
 * It is activated if at least one visible Google layer is currently in the
 * ol3 map (and vice-versa for deactivation). The top-most layer is used
 * to determine that. It is also used to change the GoogleMaps mapTypeId
 * accordingly too to fit the top-most ol3 Google layer.
 * @private
 */
olgm.herald.Layers.prototype.toggleGoogleMaps_ = function() {

  var found = null;

  // find top-most Google layer
  this.ol3map.getLayers().getArray().slice(0).reverse().every(
      function(layer) {
        if (layer instanceof olgm.layer.Google &&
            layer.getVisible() &&
            this.googleLayers_.indexOf(layer) !== -1) {
          found = layer;
          return false;
        } else {
          return true;
        }
      },
      this);

  if (found) {
    // set mapTypeId
    this.gmap.setMapTypeId(found.getMapTypeId());
    // activate
    this.activateGoogleMaps_();
  } else {
    // deactivate
    this.deactivateGoogleMaps_();
  }
};


/**
 * @typedef {{
 *   layer: (olgm.layer.Google),
 *   listenerKeys: (Array.<goog.events.Key>)
 * }}
 */
olgm.herald.Layers.GoogleLayerCache;


/**
 * @typedef {{
 *   data: (google.maps.Data),
 *   herald: (olgm.herald.VectorSource),
 *   layer: (ol.layer.Vector),
 *   opacity: (number)
 * }}
 */
olgm.herald.Layers.VectorLayerCache;
