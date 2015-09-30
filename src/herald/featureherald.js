goog.provide('olgm.herald.Feature');

goog.require('olgm.FeatureFactory');
goog.require('olgm.herald.Herald');



/**
 * The Feature Herald is responsible of listening to any changes made to
 * a single ol3 vector feature and apply those changes to a gmap vector
 * feature sibling, which gets created here as well.
 *
 * @param {!ol.Map} ol3map
 * @param {!google.maps.Map} gmap
 * @param {ol.Feature} feature
 * @constructor
 * @extends {olgm.herald.Herald}
 * @api
 */
olgm.herald.Feature = function(ol3map, gmap, feature) {

  /**
   * @type {ol.Feature}
   * @private
   */
  this.feature_ = feature;

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
  this.gmapFeature_ = new olgm.FeatureFactory().createGoogleMapsFeature(
      this.feature_);
  this.gmap.data.add(this.gmapFeature_);

  // event listeners (todo)
};


/**
 * @inheritDoc
 */
olgm.herald.Feature.prototype.deactivate = function() {

  // remove gmap feature
  this.gmap.data.remove(this.gmapFeature_);
  this.gmapFeature = null;

  goog.base(this, 'deactivate');
};
