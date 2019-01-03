/**
 * @module olgm/herald/VectorFeature
 */
import FeatureHerald from './Feature.js';
import Herald from './Herald.js';
import Listener from '../listener/Listener.js';

/**
 * @typedef {Object} Cache
 * @property {module:ol/Feature} feature
 * @property {module:olgm/herald/Feature} herald
 */

class VectorFeatureHerald extends Herald {
  /**
   * The VectorFeature Herald is responsible of sychronizing the features from
   * an ol3 vector source. The existing features in addition of those that are
   * added and removed are all managed. Each existing or added feature is bound
   * to a `olgm.herald.Feature` object. It gets unbound when removed.
   *
   * @param {module:ol/PluggableMap} ol3map openlayers map
   * @param {google.maps.Map} gmap google maps map
   * @param {ol.source.Vector} source vector source
   * @param {google.maps.Data} data google maps data object
   * @param {module:olgm/gm/MapIcon~Options} mapIconOptions map icon options
   */
  constructor(ol3map, gmap, source, data, mapIconOptions) {
    super(ol3map, gmap);

    /**
     * @type {Array<module:ol/Feature>}
     * @private
     */
    this.features_ = [];

    /**
     * @type {Array<olgm.herald.VectorFeature.Cache>}
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
     * @type {module:olgm/gm/MapIcon~Options}
     * @private
     */
    this.mapIconOptions_ = mapIconOptions;

    /**
     * @type {boolean}
     * @private
     */
    this.visible_ = true;
  }


  /**
   * @inheritDoc
   */
  activate() {
    super.activate();

    // watch existing features...
    this.source_.getFeatures().forEach((feature) => this.watchFeature_(feature));

    // event listeners
    this.listener = new Listener([
      this.source_.on('addfeature', (event) => this.handleAddFeature_(event)),
      this.source_.on('removefeature', (event) => this.handleRemoveFeature_(event))
    ]);
  }


  /**
   * @inheritDoc
   */
  deactivate() {
    // unwatch existing features...
    this.source_.getFeatures().forEach((feature) => this.unwatchFeature_(feature));

    super.deactivate();
  }


  /**
   * Set each feature visible or invisible
   * @param {boolean} value true for visible, false for invisible
   */
  setVisible(value) {
    this.visible_ = value;
    for (let i = 0; i < this.cache_.length; i++) {
      this.cache_[i].herald.setVisible(value);
    }
  }


  /**
   * @param {ol.source.Vector.Event} event addFeature event
   * @private
   */
  handleAddFeature_(event) {
    const feature = /** @type {module:ol/Feature} */ (event.feature);
    this.watchFeature_(feature);
  }


  /**
   * @param {ol.source.Vector.Event} event removeFeature event
   * @private
   */
  handleRemoveFeature_(event) {
    const feature = /** @type {module:ol/Feature} */ (event.feature);
    this.unwatchFeature_(feature);
  }


  /**
   * @param {module:ol/Feature} feature feature to watch
   * @private
   */
  watchFeature_(feature) {

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
    const herald = new FeatureHerald(ol3map, gmap, options);
    herald.activate();

    // push to cache
    this.cache_.push({
      feature: feature,
      herald: herald
    });
  }


  /**
   * @param {module:ol/Feature} feature feature to unwatch
   * @private
   */
  unwatchFeature_(feature) {
    const index = this.features_.indexOf(feature);
    if (index !== -1) {
      // remove from features (internal)
      this.features_.splice(index, 1);
      // deactivate feature herald
      this.cache_[index].herald.deactivate();
      // remove from cache
      this.cache_.splice(index, 1);
    }
  }
}


export default VectorFeatureHerald;
