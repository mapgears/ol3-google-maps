goog.provide('olgm.herald.VectorSource');

goog.require('goog.asserts');
//goog.require('ol.Feature');
goog.require('olgm.FeatureFactory');
goog.require('olgm.Herald');



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
 * @extends {olgm.Herald}
 * @api
 */
olgm.herald.VectorSource = function(ol3map, gmap, source) {

  /**
   * @type {olgm.FeatureFactory}
   * @private
   */
  this.featureFactory_ = new olgm.FeatureFactory(ol3map, gmap);

  /**
   * @type {ol.source.Vector}
   * @private
   */
  this.source_ = source;

  goog.base(this, ol3map, gmap);
};
goog.inherits(olgm.herald.VectorSource, olgm.Herald);


/**
 * @inheritDoc
 */
olgm.herald.VectorSource.prototype.activate = function() {
  goog.base(this, 'activate');

  // watch existing features...

  // event listeners
  var keys = this.listenerKeys;
  keys.push(this.source_.on('addfeature', this.handleSourceAddFeature_, this));
};


/**
 * @inheritDoc
 */
olgm.herald.VectorSource.prototype.deactivate = function() {
  goog.base(this, 'deactivate');
};


/**
 * @param {ol.source.VectorEvent} event
 * @private
 */
olgm.herald.VectorSource.prototype.handleSourceAddFeature_ = function(event) {
  var feature = event.feature;
  goog.asserts.assertInstanceof(feature, ol.Feature);

  // FIXME - keep a reference between the two objects for future purpose,
  //         such as removal from the layer
  var gmapFeature = this.featureFactory_.createGoogleMapsFeature(feature);

  this.gmap.data.add(gmapFeature);
};
