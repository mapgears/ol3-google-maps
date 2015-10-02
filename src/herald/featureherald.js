goog.provide('olgm.herald.Feature');

goog.require('goog.asserts');
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
 * @constructor
 * @extends {olgm.herald.Herald}
 */
olgm.herald.Feature = function(ol3map, gmap, feature, data) {

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

  goog.base(this, ol3map, gmap);

};
goog.inherits(olgm.herald.Feature, olgm.herald.Herald);


/**
 * @type {google.maps.Data.Feature}
 * @private
 */
olgm.herald.Feature.prototype.gmapFeature_ = null;


/**
 * @inheritDoc
 */
olgm.herald.Feature.prototype.activate = function() {
  goog.base(this, 'activate');

  // create gmap feature
  this.gmapFeature_ = olgm.gm.createFeature(this.feature_);
  this.data_.add(this.gmapFeature_);

  // override style if a style is defined at the feature level
  var gmStyle = olgm.gm.createStyle(this.feature_);
  if (gmStyle) {
    this.data_.overrideStyle(this.gmapFeature_, gmStyle);
  }

  var geometry = this.feature_.getGeometry();

  // event listeners (todo)
  var keys = this.listenerKeys;
  keys.push(geometry.on('change', this.handleGeometryChange_, this));
};


/**
 * @inheritDoc
 */
olgm.herald.Feature.prototype.deactivate = function() {

  // remove gmap feature
  this.data_.remove(this.gmapFeature_);
  this.gmapFeature_ = null;

  goog.base(this, 'deactivate');
};


/**
 * @private
 */
olgm.herald.Feature.prototype.handleGeometryChange_ = function() {
  var geometry = this.feature_.getGeometry();
  goog.asserts.assertInstanceof(geometry, ol.geom.Geometry);
  this.gmapFeature_.setGeometry(olgm.gm.createFeatureGeometry(geometry));
};
