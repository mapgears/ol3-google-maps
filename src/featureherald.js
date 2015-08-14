goog.provide('olgm.FeatureHerald');

goog.require('goog.asserts');
goog.require('olgm.FeatureFactory');
goog.require('olgm.Herald');



/**
 * The Feature Herald is responsible of listening to any vector layer added
 * or removed on the ol3 map and listen to features added in their sources
 * to create the same feature in the Google Maps map.
 *
 * The ol3 maps is the 'master' here, i.e. features added to a GoogleMaps map
 * are not added to the ol3 map.
 *
 * @param {!ol.Map} ol3map
 * @param {!google.maps.Map} gmap
 * @constructor
 * @extends {olgm.Herald}
 * @api
 */
olgm.FeatureHerald = function(ol3map, gmap) {

  /**
   * @type {olgm.FeatureFactory}
   * @private
   */
  this.featureFactory_ = new olgm.FeatureFactory(ol3map, gmap);

  goog.base(this, ol3map, gmap);
};
goog.inherits(olgm.FeatureHerald, olgm.Herald);


/**
 * @inheritDoc
 */
olgm.FeatureHerald.prototype.activate = function() {
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
 * @inheritDoc
 */
olgm.FeatureHerald.prototype.deactivate = function() {
  goog.base(this, 'deactivate');

  // unwatch existing layers
  var layers = this.ol3map.getLayers();
  layers.forEach(function(layer) {
    this.unwatchLayer_(layer);
  }, this);
};


/**
 * Callback method fired when a new layer is added to the map.
 * @param {ol.CollectionEvent} event Collection event.
 * @private
 */
olgm.FeatureHerald.prototype.handleLayersAdd_ = function(event) {
  var layer = event.element;
  goog.asserts.assertInstanceof(layer, ol.layer.Base);
  this.watchLayer_(layer);
};


/**
 * Callback method fired when a layer is removed from the map.
 * @param {ol.CollectionEvent} event Collection event.
 * @private
 */
olgm.FeatureHerald.prototype.handleLayersRemove_ = function(event) {
  var layer = event.element;
  goog.asserts.assertInstanceof(layer, ol.layer.Base);
  this.unwatchLayer_(layer);
};


/**
 * Watch the layer
 * @param {ol.layer.Base} layer
 * @private
 */
olgm.FeatureHerald.prototype.watchLayer_ = function(layer) {
  // watch only vector layers
  if (!(layer instanceof ol.layer.Vector)) {
    return;
  }

  // listen to feature added to the source of this layer
  var source = layer.getSource();
  source.on('addfeature', this.handleVectorSourceAddFeature_, this);

  // FIXME - manage existing features
};


/**
 * Unwatch the layer
 * @param {ol.layer.Base} layer
 * @private
 */
olgm.FeatureHerald.prototype.unwatchLayer_ = function(layer) {
  // unwatch only vector layers
  if (!(layer instanceof ol.layer.Vector)) {
    return;
  }

  // unlisten
  var source = layer.getSource();
  source.un('addfeature', this.handleVectorSourceAddFeature_, this);
};


/**
 * @param {ol.source.VectorEvent} event
 * @private
 */
olgm.FeatureHerald.prototype.handleVectorSourceAddFeature_ = function(event) {
  var feature = event.feature;
  goog.asserts.assertInstanceof(feature, ol.Feature);

  // FIXME - keep a reference between the two objects for future purpose,
  //         such as removal from the layer
  var gmapFeature = this.featureFactory_.createGoogleMapsFeature(feature);

  this.gmap.data.add(gmapFeature);
};
