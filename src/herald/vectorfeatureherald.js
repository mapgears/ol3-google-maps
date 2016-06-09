goog.provide('olgm.herald.VectorFeature');

goog.require('goog.asserts');
goog.require('olgm.herald.Feature');
goog.require('olgm.herald.Herald');



/**
 * The VectorFeature Herald is responsible of sychronizing the features from
 * an ol3 vector source. The existing features in addition of those that are
 * added and removed are all managed. Each existing or added feature is bound
 * to a `olgm.herald.Feature` object. It gets unbound when removed.
 *
 * @param {!ol.Map} ol3map
 * @param {!google.maps.Map} gmap
 * @param {!ol.source.Vector} source
 * @param {!google.maps.Data} data
 * @constructor
 * @extends {olgm.herald.Herald}
 */
olgm.herald.VectorFeature = function(ol3map, gmap, source, data) {

  /**
   * @type {Array.<ol.Feature>}
   * @private
   */
  this.features_ = [];

  /**
   * @type {Array.<olgm.herald.VectorFeature.Cache>}
   * @private
   */
  this.cache_ = [];

  /**
   * @type {!google.maps.Data}
   * @private
   */
  this.data_ = data;

  /**
   * @type {ol.source.Vector}
   * @private
   */
  this.source_ = source;

  goog.base(this, ol3map, gmap);
};
goog.inherits(olgm.herald.VectorFeature, olgm.herald.Herald);


/**
 * @inheritDoc
 */
olgm.herald.VectorFeature.prototype.activate = function() {
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
olgm.herald.VectorFeature.prototype.deactivate = function() {
  // unwatch existing features...
  this.source_.getFeatures().forEach(this.unwatchFeature_, this);

  goog.base(this, 'deactivate');
};


/**
 * @param {ol.source.VectorEvent} event
 * @private
 */
olgm.herald.VectorFeature.prototype.handleAddFeature_ = function(event) {
  var feature = event.feature;
  goog.asserts.assertInstanceof(feature, ol.Feature);
  this.watchFeature_(feature);
};


/**
 * @param {ol.source.VectorEvent} event
 * @private
 */
olgm.herald.VectorFeature.prototype.handleRemoveFeature_ = function(event) {
  var feature = event.feature;
  goog.asserts.assertInstanceof(feature, ol.Feature);
  this.unwatchFeature_(feature);
};


/**
 * @param {ol.Feature} feature
 * @private
 */
olgm.herald.VectorFeature.prototype.watchFeature_ = function(feature) {

  var ol3map = this.ol3map;
  var gmap = this.gmap;
  var data = this.data_;

  // push to features (internal)
  this.features_.push(feature);

  var index = this.features_.indexOf(feature);

  // create and activate feature herald
  var herald = new olgm.herald.Feature(ol3map, gmap, feature, data, index);
  herald.activate();

  // push to cache
  this.cache_.push({
    feature: feature,
    herald: herald
  });
};


/**
 * @param {ol.Feature} feature
 * @private
 */
olgm.herald.VectorFeature.prototype.unwatchFeature_ = function(feature) {
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
olgm.herald.VectorFeature.Cache;
