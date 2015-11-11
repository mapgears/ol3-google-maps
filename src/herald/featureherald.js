goog.provide('olgm.herald.Feature');

goog.require('goog.asserts');
goog.require('olgm');
goog.require('olgm.gm');
goog.require('olgm.herald.Herald');



/**
 * The Feature Herald is responsible of synchronizing a single ol3 vector
 * feature to a gmap feature. Here's what synchronized within the feature:
 *
 * - its geometry
 * - its style
 *
 * @param {!ol.Map} ol3map
 * @param {!google.maps.Map} gmap
 * @param {ol.Feature} feature
 * @param {!google.maps.Data} data
 * @param {number} index
 * @constructor
 * @extends {olgm.herald.Herald}
 */
olgm.herald.Feature = function(ol3map, gmap, feature, data, index) {

  /**
   * @type {ol.Feature}
   * @private
   */
  this.feature_ = feature;

  /**
   * @type {!google.maps.Data}
   * @private
   */
  this.data_ = data;

  /**
   * @type {number}
   * @private
   */
  this.index_ = index;

  goog.base(this, ol3map, gmap);

};
goog.inherits(olgm.herald.Feature, olgm.herald.Herald);


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
 * @inheritDoc
 */
olgm.herald.Feature.prototype.activate = function() {
  goog.base(this, 'activate');

  var geometry = this.feature_.getGeometry();
  goog.asserts.assertInstanceof(geometry, ol.geom.Geometry);

  // create gmap feature
  this.gmapFeature_ = olgm.gm.createFeature(this.feature_);
  this.data_.add(this.gmapFeature_);

  // override style if a style is defined at the feature level
  var gmStyle = olgm.gm.createStyle(this.feature_, this.index_);
  if (gmStyle) {
    this.data_.overrideStyle(this.gmapFeature_, gmStyle);
  }

  // if the feature has text style, add a map label to gmap
  var style = olgm.getStyleOf(this.feature_);
  if (style) {
    var text = style.getText();
    if (text) {
      var latLng = olgm.gm.createLatLng(olgm.getCenterOf(geometry));
      this.label_ = olgm.gm.createLabel(text, latLng, this.index_);
      this.label_.setMap(this.gmap);
    }
  }

  // event listeners (todo)
  var keys = this.listenerKeys;
  this.geometryChangeKey_ = geometry.on('change',
                                        this.handleGeometryChange_,
                                        this);
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

  // remove label
  if (this.label_) {
    this.label_.setMap(null);
    this.label_ = null;
  }

  goog.base(this, 'deactivate');
};


/**
 * @private
 */
olgm.herald.Feature.prototype.handleGeometryChange_ = function() {
  var geometry = this.feature_.getGeometry();
  goog.asserts.assertInstanceof(geometry, ol.geom.Geometry);
  this.gmapFeature_.setGeometry(olgm.gm.createFeatureGeometry(geometry));

  if (this.label_) {
    var latLng = olgm.gm.createLatLng(olgm.getCenterOf(geometry));
    this.label_.set('position', latLng);
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
