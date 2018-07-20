/**
 * @module olgm/herald/Feature
 */
import Observable from 'ol/Observable.js';
import Icon from 'ol/style/Icon.js';
import {getCenterOf, getStyleOf} from '../util.js';
import {assert} from '../asserts.js';
import {createFeature, createStyle, createLatLng, createMapIcon,
  createLabel, createFeatureGeometry} from '../gm.js';
import Herald from './Herald.js';

class FeatureHerald extends Herald {
  /**
   * The Feature Herald is responsible of synchronizing a single ol3 vector
   * feature to a gmap feature. Here's what synchronized within the feature:
   *
   * - its geometry
   * - its style
   *
   * @param {module:ol/PluggableMap} ol3map openlayers map
   * @param {google.maps.Map} gmap google maps map
   * @param {olgmx.herald.FeatureOptions} options options
   */
  constructor(ol3map, gmap, options) {
    super(ol3map, gmap);

    /**
     * @type {module:ol/Feature}
     * @private
     */
    this.feature_ = options.feature;

    /**
     * @type {!google.maps.Data}
     * @private
     */
    this.data_ = options.data;

    /**
     * @type {number}
     * @private
     */
    this.index_ = options.index;

    /**
     * @type {module:olgm/gm/MapIcon~Options}
     * @private
     */
    this.mapIconOptions_ = options.mapIconOptions;

    /**
     * @type {boolean}
     * @private
     */
    this.visible_ = options.visible !== undefined ? options.visible : true;

    /**
     * @type {google.maps.Data.Feature}
     * @private
     */
    this.gmapFeature_ = null;

    /**
     * @type {module:olgm/gm/MapLabel}
     * @private
     */
    this.label_ = null;

    /**
     * The marker object contains a marker to draw on a canvas instead of using
     * the Google Maps API. If useCanvas_ is set to false, this variable won't
     * be used.
     * @type {module:olgm/gm/MapIcon}
     * @private
     */
    this.marker_ = null;
  }


  /**
   * @inheritDoc
   */
  activate() {
    super.activate();

    const geometry = this.getGeometry_();

    // create gmap feature
    this.gmapFeature_ = createFeature(this.feature_);

    if (this.visible_) {
      this.data_.add(this.gmapFeature_);
    }

    // override style if a style is defined at the feature level
    const gmStyle = createStyle(
      this.feature_, this.mapIconOptions_, this.index_);
    if (gmStyle) {
      this.data_.overrideStyle(this.gmapFeature_, gmStyle);
    }

    // if the feature has text style, add a map label to gmap
    const latLng = createLatLng(getCenterOf(geometry));
    const style = getStyleOf(this.feature_);

    if (style) {
      const zIndex = style.getZIndex();
      const index = zIndex !== undefined ? zIndex : this.index_;

      const image = style.getImage();
      const useCanvas = this.mapIconOptions_.useCanvas !== undefined ?
        this.mapIconOptions_.useCanvas : false;
      if (image && image instanceof Icon && useCanvas) {
        this.marker_ = createMapIcon(image, latLng, index);
        if (this.visible_) {
          this.marker_.setMap(this.gmap);
        }
      }

      const text = style.getText();
      if (text) {
        this.label_ = createLabel(text, latLng, index);
        if (this.visible_) {
          this.label_.setMap(this.gmap);
        }
      }
    }

    // event listeners (todo)
    const keys = this.listenerKeys;
    this.geometryChangeKey_ = geometry.on(
      'change', () => this.handleGeometryChange_);
    keys.push(this.geometryChangeKey_);
    keys.push(this.feature_.on(
      'change:' + this.feature_.getGeometryName(),
      () => this.handleGeometryReplace_
    ));
  }


  /**
   * @inheritDoc
   */
  deactivate() {

    // remove gmap feature
    this.data_.remove(this.gmapFeature_);
    this.gmapFeature_ = null;

    // remove feature
    if (this.marker_) {
      this.marker_.setMap(null);
      this.marker_ = null;
    }

    // remove label
    if (this.label_) {
      this.label_.setMap(null);
      this.label_ = null;
    }

    super.deactivate();
  }


  /**
   * Set visible or invisible, without deleting the feature object
   * @param {boolean} value true to set visible, false to set invisible
   */
  setVisible(value) {
    if (value && !this.visible_) {
      this.data_.add(this.gmapFeature_);

      if (this.marker_) {
        this.marker_.setMap(this.gmap);
      }

      if (this.label_) {
        this.label_.setMap(this.gmap);
      }

      this.visible_ = true;
    } else if (!value && this.visible_) {

      this.data_.remove(this.gmapFeature_);

      if (this.marker_) {
        this.marker_.setMap(null);
      }

      if (this.label_) {
        this.label_.setMap(null);
      }

      this.visible_ = false;
    }
  }

  /**
   * @private
   * @return {module:ol/geom/Geometry} the feature's geometry
   */
  getGeometry_() {
    const geometry = this.feature_.getGeometry();
    assert(
      geometry !== undefined, 'Expected feature to have geometry');
    return /** @type {module:ol/geom/Geometry} */ (geometry);
  }


  /**
   * @private
   */
  handleGeometryChange_() {
    const geometry = this.getGeometry_();
    this.gmapFeature_.setGeometry(createFeatureGeometry(geometry));

    let latLng;

    if (this.label_) {
      latLng = createLatLng(getCenterOf(geometry));
      this.label_.set('position', latLng);
    }

    if (this.marker_) {
      latLng = createLatLng(getCenterOf(geometry));
      this.marker_.set('position', latLng);
    }
  }


  /**
   * @private
   */
  handleGeometryReplace_() {
    const keys = this.listenerKeys;
    Observable.unByKey(this.geometryChangeKey_);
    const index = keys.indexOf(this.geometryChangeKey_);
    keys.splice(index, 1);

    this.geometryChangeKey_ = this.feature_.getGeometry().on('change',
      () => this.handleGeometryChange_);
    keys.push(this.geometryChangeKey_);
    this.handleGeometryChange_();
  }
}
export default FeatureHerald;
