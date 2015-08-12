goog.provide('olgm.FeatureHerald');

goog.require('olgm.Herald');



/**
 * The Feature Herald is responsible of listening to any vector layer added
 * or removed on the ol3 map and listen to features added in their sources
 * to create the same feature in the Google Maps map.
 *
 * The ol3 maps is the 'master' here, i.e. features added to a GoogleMaps map
 * are not added to the ol3 map.
 *
 * @param {!ol.Map} ol3map
 * @param {!google.maps.Map} gmap
 * @constructor
 * @extends {olgm.Herald}
 * @api
 */
olgm.FeatureHerald = function(ol3map, gmap) {
  goog.base(this, ol3map, gmap);
};
goog.inherits(olgm.FeatureHerald, olgm.Herald);


/**
 * @inheritDoc
 */
olgm.FeatureHerald.prototype.activate = function() {
  goog.base(this, 'activate');

  console.log(2);


  var keys = this.listenerKeys;
  var view = this.ol3map.getView();
  keys.push(view.on('change:center', this.handleOl3MapViewCenterChange_, this));
};


/**
 * @private
 */
olgm.FeatureHerald.prototype.handleOl3MapViewCenterChange_ = function() {
  // todo
  console.log(1);
};
