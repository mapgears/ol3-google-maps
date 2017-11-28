goog.provide('olgm.herald.VectorFeature');

goog.require('ol');
goog.require('olgm.herald.Feature');
goog.require('olgm.herald.Herald');


/**
 * The VectorFeature Herald is responsible of sychronizing the features from
 * an ol3 vector source. The existing features in addition of those that are
 * added and removed are all managed. Each existing or added feature is bound
 * to a `olgm.herald.Feature` object. It gets unbound when removed.
 *
 * @param {!ol.Map} ol3map openlayers map
 * @param {!google.maps.Map} gmap google maps map
 * @param {!ol.source.Vector} source vector source
 * @param {!google.maps.Data} data google maps data object
 * @param {olgmx.gm.MapIconOptions} mapIconOptions map icon options
 * @constructor
 * @extends {olgm.herald.Herald}
 */
olgm.herald.VectorFeature = function(
    ol3map, gmap, source, data, mapIconOptions) {

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

  /**
   * @type {olgmx.gm.MapIconOptions}
   * @private
   */
  this.mapIconOptions_ = mapIconOptions;

  /**
   * @type {boolean}
   * @private
   */
  this.visible_ = true;

  olgm.herald.Herald.call(this, ol3map, gmap);
};
ol.inherits(olgm.herald.VectorFeature, olgm.herald.Herald);


/**
 * @inheritDoc
 */
olgm.herald.VectorFeature.prototype.activate = function() {

  olgm.herald.Herald.prototype.activate.call(this);

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

  olgm.herald.Herald.prototype.deactivate.call(this);
};


/**
 * Set each feature visible or invisible
 * @param {boolean} value true for visible, false for invisible
 */
olgm.herald.VectorFeature.prototype.setVisible = function(value) {
  this.visible_ = value;
  for (var i = 0; i < this.cache_.length; i++) {
    this.cache_[i].herald.setVisible(value);
  }
};


/**
 * @param {ol.source.Vector.Event} event addFeature event
 * @private
 */
olgm.herald.VectorFeature.prototype.handleAddFeature_ = function(event) {
  var feature = /** @type {ol.Feature} */ (event.feature);
  this.watchFeature_(feature);
};


/**
 * @param {ol.source.Vector.Event} event removeFeature event
 * @private
 */
olgm.herald.VectorFeature.prototype.handleRemoveFeature_ = function(event) {
  var feature = /** @type {ol.Feature} */ (event.feature);
  this.unwatchFeature_(feature);
};


/**
 * @param {ol.Feature} feature feature to watch
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
  var options = {
    feature: feature,
    data: data,
    index: index,
    mapIconOptions: this.mapIconOptions_,
    visible: this.visible_
  };
  var herald = new olgm.herald.Feature(ol3map, gmap, options);
  herald.activate();

  // push to cache
  this.cache_.push({
    feature: feature,
    herald: herald
  });
};


/**
 * @param {ol.Feature} feature feature to unwatch
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
