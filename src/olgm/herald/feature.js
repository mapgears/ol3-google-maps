goog.provide('olgm.herald.Feature');

goog.require('ol');
goog.require('ol.Observable');
goog.require('ol.style.Icon');
goog.require('olgm');
goog.require('olgm.asserts');
goog.require('olgm.gm');
goog.require('olgm.herald.Herald');


/**
 * The Feature Herald is responsible of synchronizing a single ol3 vector
 * feature to a gmap feature. Here's what synchronized within the feature:
 *
 * - its geometry
 * - its style
 *
 * @param {!ol.Map} ol3map openlayers map
 * @param {!google.maps.Map} gmap google maps map
 * @param {olgmx.herald.FeatureOptions} options options
 * @constructor
 * @extends {olgm.herald.Herald}
 */
olgm.herald.Feature = function(ol3map, gmap, options) {

  /**
   * @type {ol.Feature}
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
   * @type {olgmx.gm.MapIconOptions}
   * @private
   */
  this.mapIconOptions_ = options.mapIconOptions;

  /**
   * @type {boolean}
   * @private
   */
  this.visible_ = options.visible !== undefined ? options.visible : true;

  olgm.herald.Herald.call(this, ol3map, gmap);

};
ol.inherits(olgm.herald.Feature, olgm.herald.Herald);


/**
 * @type {google.maps.Data.Feature}
 * @private
 */
olgm.herald.Feature.prototype.gmapFeature_ = null;


/**
 * @type {olgm.gm.MapLabel}
 * @private
 */
olgm.herald.Feature.prototype.label_ = null;

/**
 * The marker object contains a marker to draw on a canvas instead of using
 * the Google Maps API. If useCanvas_ is set to false, this variable won't
 * be used.
 * @type {olgm.gm.MapIcon}
 * @private
 */
olgm.herald.Feature.prototype.marker_ = null;


/**
 * @inheritDoc
 */
olgm.herald.Feature.prototype.activate = function() {

  olgm.herald.Herald.prototype.activate.call(this);

  var geometry = this.getGeometry_();

  // create gmap feature
  this.gmapFeature_ = olgm.gm.createFeature(this.feature_);

  if (this.visible_) {
    this.data_.add(this.gmapFeature_);
  }

  // override style if a style is defined at the feature level
  var gmStyle = olgm.gm.createStyle(
      this.feature_, this.mapIconOptions_, this.index_);
  if (gmStyle) {
    this.data_.overrideStyle(this.gmapFeature_, gmStyle);
  }

  // if the feature has text style, add a map label to gmap
  var latLng = olgm.gm.createLatLng(olgm.getCenterOf(geometry));
  var style = olgm.getStyleOf(this.feature_);

  if (style) {
    var zIndex = style.getZIndex();
    var index = zIndex !== undefined ? zIndex : this.index_;

    var image = style.getImage();
    var useCanvas = this.mapIconOptions_.useCanvas !== undefined ?
      this.mapIconOptions_.useCanvas : false;
    if (image && image instanceof ol.style.Icon && useCanvas) {
      this.marker_ = olgm.gm.createMapIcon(image, latLng, index);
      if (this.visible_) {
        this.marker_.setMap(this.gmap);
      }
    }

    var text = style.getText();
    if (text) {
      this.label_ = olgm.gm.createLabel(text, latLng, index);
      if (this.visible_) {
        this.label_.setMap(this.gmap);
      }
    }
  }

  // event listeners (todo)
  var keys = this.listenerKeys;
  this.geometryChangeKey_ = geometry.on(
      'change', this.handleGeometryChange_, this);
  keys.push(this.geometryChangeKey_);
  keys.push(this.feature_.on(
      'change:' + this.feature_.getGeometryName(),
      this.handleGeometryReplace_, this
  ));
};


/**
 * @inheritDoc
 */
olgm.herald.Feature.prototype.deactivate = function() {

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

  olgm.herald.Herald.prototype.deactivate.call(this);
};


/**
 * Set visible or invisible, without deleting the feature object
 * @param {boolean} value true to set visible, false to set invisible
 */
olgm.herald.Feature.prototype.setVisible = function(value) {
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
};

/**
 * @private
 * @return {ol.geom.Geometry} the feature's geometry
 */
olgm.herald.Feature.prototype.getGeometry_ = function() {
  var geometry = this.feature_.getGeometry();
  olgm.asserts.assert(
      geometry !== undefined, 'Expected feature to have geometry');
  return /** @type {ol.geom.Geometry} */ (geometry);
};


/**
 * @private
 */
olgm.herald.Feature.prototype.handleGeometryChange_ = function() {
  var geometry = this.getGeometry_();
  this.gmapFeature_.setGeometry(olgm.gm.createFeatureGeometry(geometry));

  var latLng;

  if (this.label_) {
    latLng = olgm.gm.createLatLng(olgm.getCenterOf(geometry));
    this.label_.set('position', latLng);
  }

  if (this.marker_) {
    latLng = olgm.gm.createLatLng(olgm.getCenterOf(geometry));
    this.marker_.set('position', latLng);
  }
};


/**
 * @private
 */
olgm.herald.Feature.prototype.handleGeometryReplace_ = function() {
  var keys = this.listenerKeys;
  ol.Observable.unByKey(this.geometryChangeKey_);
  var index = keys.indexOf(this.geometryChangeKey_);
  keys.splice(index, 1);

  this.geometryChangeKey_ = this.feature_.getGeometry().on('change',
      this.handleGeometryChange_,
      this);
  keys.push(this.geometryChangeKey_);
  this.handleGeometryChange_();
};
