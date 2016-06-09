goog.provide('olgm.herald.Source');

goog.require('olgm.herald.Herald');



/**
 * This is an abstract class. Children of this class will listen to one or
 * multiple layers of a specific class to render them using the Google Maps
 * API whenever a Google Maps layer is active.
 * @param {!ol.Map} ol3map
 * @param {!google.maps.Map} gmap
 * @constructor
 * @extends {olgm.herald.Herald}
 */
olgm.herald.Source = function(ol3map, gmap) {
  goog.base(this, ol3map, gmap);

  /**
   * Flag that determines whether the GoogleMaps map is currently active, i.e.
   * is currently shown and has the OpenLayers map added as one of its control.
   * @type {boolean}
   * @protected
   */
  olgm.herald.Source.prototype.googleMapsIsActive_ = false;
};
goog.inherits(olgm.herald.Source, olgm.herald.Herald);


/**
 * Watch the layer. This adds the layer to the list of layers the herald is
 * listening to, so that it can display it using Google Maps as soon as the
 * layer becomes visible.
 * @param {ol.layer.Base} layer
 * @api
 */
olgm.herald.Source.prototype.watchLayer = goog.abstractMethod;


/**
 * Stop watching the layer. This removes the layer from the list of layers the
 * herald is listening to, and restores its original opacity.
 * @param {ol.layer.Base} layer
 * @api
 */
olgm.herald.Source.prototype.unwatchLayer = goog.abstractMethod;


/**
 * Set the googleMapsIsActive value to true or false
 * @param {boolean} active
 * @api
 */
olgm.herald.Source.prototype.setGoogleMapsActive = function(active) {
  this.googleMapsIsActive = active;
};
