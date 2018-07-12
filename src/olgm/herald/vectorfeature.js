/**
 * @module olgm/herald/VectorFeature
 */
import {inherits} from 'ol/index.js';
import Feature from './Feature.js';
import Herald from './Herald.js';

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
const VectorFeature = function(
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

  Herald.call(this, ol3map, gmap);
};

inherits(VectorFeature, Herald);


/**
 * @inheritDoc
 */
VectorFeature.prototype.activate = function() {

  Herald.prototype.activate.call(this);

  // watch existing features...
  this.source_.getFeatures().forEach(this.watchFeature_, this);

  // event listeners
  const keys = this.listenerKeys;
  keys.push(this.source_.on('addfeature', this.handleAddFeature_, this));
  keys.push(this.source_.on('removefeature', this.handleRemoveFeature_, this));
};


/**
 * @inheritDoc
 */
VectorFeature.prototype.deactivate = function() {
  // unwatch existing features...
  this.source_.getFeatures().forEach(this.unwatchFeature_, this);

  Herald.prototype.deactivate.call(this);
};


/**
 * Set each feature visible or invisible
 * @param {boolean} value true for visible, false for invisible
 */
VectorFeature.prototype.setVisible = function(value) {
  this.visible_ = value;
  for (let i = 0; i < this.cache_.length; i++) {
    this.cache_[i].herald.setVisible(value);
  }
};


/**
 * @param {ol.source.Vector.Event} event addFeature event
 * @private
 */
VectorFeature.prototype.handleAddFeature_ = function(event) {
  const feature = /** @type {ol.Feature} */ (event.feature);
  this.watchFeature_(feature);
};


/**
 * @param {ol.source.Vector.Event} event removeFeature event
 * @private
 */
VectorFeature.prototype.handleRemoveFeature_ = function(event) {
  const feature = /** @type {ol.Feature} */ (event.feature);
  this.unwatchFeature_(feature);
};


/**
 * @param {ol.Feature} feature feature to watch
 * @private
 */
VectorFeature.prototype.watchFeature_ = function(feature) {

  const ol3map = this.ol3map;
  const gmap = this.gmap;
  const data = this.data_;

  // push to features (internal)
  this.features_.push(feature);

  const index = this.features_.indexOf(feature);

  // create and activate feature herald
  const options = {
    feature: feature,
    data: data,
    index: index,
    mapIconOptions: this.mapIconOptions_,
    visible: this.visible_
  };
  const herald = new Feature(ol3map, gmap, options);
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
VectorFeature.prototype.unwatchFeature_ = function(feature) {
  const index = this.features_.indexOf(feature);
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
VectorFeature.Cache;
export default VectorFeature;
