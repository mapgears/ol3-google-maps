goog.provide('olgm.herald.Layers');

goog.require('goog.asserts');
//goog.require('ol.layer.Base');
//goog.require('ol.layer.Vector');
goog.require('olgm.herald.Herald');
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
 * @inheritDoc
 */
olgm.herald.Layers.prototype.activate = function() {
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
  this.setGoogleMapsMapType_();

  if (this.googleLayers_.length === 1) {
    this.activateGoogleMaps_();
  }
};


/**
 * Watch the vector layer
 * @param {ol.layer.Vector} layer
 * @private
 */
olgm.herald.Layers.prototype.watchVectorLayer_ = function(layer) {

  // a source is required to work with this layer
  var source = layer.getSource();
  if (!source) {
    return;
  }

  this.vectorLayers_.push(layer);

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
    if (this.googleLayers_.length === 0) {
      this.deactivateGoogleMaps_();
    } else {
      this.setGoogleMapsMapType_();
    }
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

    // herald
    cacheItem.herald.deactivate();

    // opacity
    layer.setOpacity(cacheItem.opacity);

    this.vectorCache_.splice(index, 1);
  }
};


/**
 * @private
 */
olgm.herald.Layers.prototype.setGoogleMapsMapType_ = function() {
  var found;
  if (this.googleLayers_.length === 1) {
    found = this.googleLayers_[0];
  } else {
    // find top-most Google layer
    this.ol3map.getLayers().getArray().slice(0).reverse().every(
        function(layer) {
          if (layer instanceof olgm.layer.Google) {
            found = layer;
            return false;
          } else {
            return true;
          }
        },
        this);
  }

  if (!found) {
    return;
  }

  var mapTypeId = found.getMapTypeId();

  this.gmap.setMapTypeId(mapTypeId);

};


/**
 * @private
 */
olgm.herald.Layers.prototype.activateGoogleMaps_ = function() {
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

};


/**
 * @private
 */
olgm.herald.Layers.prototype.deactivateGoogleMaps_ = function() {
  this.gmap.controls[google.maps.ControlPosition.TOP_LEFT].removeAt(0);
  this.targetEl_.appendChild(this.ol3mapEl_);
  this.gmapEl_.remove();

  this.viewHerald_.deactivate();

  this.vectorCache_.forEach(function(item, index) {
    item.layer.setOpacity(item.opacity);
  }, this);

  this.ol3mapEl_.style.position = 'relative';
};


/**
 * @typedef {{
 *   herald: (olgm.herald.VectorSource),
 *   layer: (ol.layer.Vector),
 *   opacity: (number)
 * }}
 */
olgm.herald.Layers.VectorLayerCache;
