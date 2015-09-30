goog.provide('olgm.herald.VectorSource');

goog.require('goog.asserts');
//goog.require('ol.Feature');
goog.require('olgm.FeatureFactory');
goog.require('olgm.herald.Feature');
goog.require('olgm.herald.Herald');



/**
 * The VectorSource Herald is responsible of listening to features added and
 * removed in a vector source and create the same feature in the Google Maps
 * map.
 *
 * The ol3 maps is the 'master' here, i.e. features added to a GoogleMaps map
 * are not added to the ol3 map.
 *
 * @param {!ol.Map} ol3map
 * @param {!google.maps.Map} gmap
 * @param {!ol.source.Vector} source
 * @constructor
 * @extends {olgm.herald.Herald}
 * @api
 */
olgm.herald.VectorSource = function(ol3map, gmap, source) {

  /**
   * @type {Array.<ol.Feature>}
   * @private
   */
  this.features_ = [];

  /**
   * @type {Array.<olgm.herald.VectorSource.Cache>}
   * @private
   */
  this.cache_ = [];

  /**
   * @type {ol.source.Vector}
   * @private
   */
  this.source_ = source;

  goog.base(this, ol3map, gmap);
};
goog.inherits(olgm.herald.VectorSource, olgm.herald.Herald);


/**
 * @inheritDoc
 */
olgm.herald.VectorSource.prototype.activate = function() {
  goog.base(this, 'activate');

  // watch existing features...
  this.source_.getFeatures().forEach(this.watchFeature_, this);

  // event listeners
  var keys = this.listenerKeys;
  keys.push(this.source_.on('addfeature', this.handleAddFeature_, this));
  keys.push(this.source_.on('removefeature', this.handleRemoveFeature_, this));
};


/**
 * @inheritDoc
 */
olgm.herald.VectorSource.prototype.deactivate = function() {
  // unwatch existing features...
  this.source_.getFeatures().forEach(this.unwatchFeature_, this);

  goog.base(this, 'deactivate');
};


/**
 * @param {ol.source.VectorEvent} event
 * @private
 */
olgm.herald.VectorSource.prototype.handleAddFeature_ = function(event) {
  var feature = event.feature;
  goog.asserts.assertInstanceof(feature, ol.Feature);
  this.watchFeature_(feature);
};


/**
 * @param {ol.source.VectorEvent} event
 * @private
 */
olgm.herald.VectorSource.prototype.handleRemoveFeature_ = function(event) {
  var feature = event.feature;
  goog.asserts.assertInstanceof(feature, ol.Feature);
  this.unwatchFeature_(feature);
};


/**
 * @param {ol.Feature} feature
 * @private
 */
olgm.herald.VectorSource.prototype.watchFeature_ = function(feature) {

  // push to features (internal)
  this.features_.push(feature);

  // create and activate feature herald
  var herald = new olgm.herald.Feature(this.ol3map, this.gmap, feature);
  herald.activate();

  // push to cache
  this.cache_.push({
    'feature': feature,
    'herald': herald
  });
};


/**
 * @param {ol.Feature} feature
 * @private
 */
olgm.herald.VectorSource.prototype.unwatchFeature_ = function(feature) {
  var index = this.features_.indexOf(feature);
  if (index !== -1) {
    // remove from features (internal)
    this.features_.splice(index, 1);
    // deactivate feature herald
    this.cache_[index].herald.deactivate();
    // remove from cache
    this.cache_.splice(index, 1);
  }
};


/**
 * @typedef {{
 *   feature: (ol.Feature),
 *   herald: (olgm.herald.Feature)
 * }}
 */
olgm.herald.VectorSource.Cache;
