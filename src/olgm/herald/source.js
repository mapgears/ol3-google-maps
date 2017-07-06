goog.provide('olgm.herald.Source');

goog.require('ol');
goog.require('olgm.herald.Herald');


/**
 * This is an abstract class. Children of this class will listen to one or
 * multiple layers of a specific class to render them using the Google Maps
 * API whenever a Google Maps layer is active.
 * @param {!ol.Map} ol3map openlayers map
 * @param {!google.maps.Map} gmap google maps map
 * @abstract
 * @constructor
 * @extends {olgm.herald.Herald}
 */
olgm.herald.Source = function(ol3map, gmap) {

  olgm.herald.Herald.call(this, ol3map, gmap);

  /**
   * Flag that determines whether the GoogleMaps map is currently active, i.e.
   * is currently shown and has the OpenLayers map added as one of its control.
   * @type {boolean}
   * @protected
   */
  olgm.herald.Source.prototype.googleMapsIsActive_ = false;
};
ol.inherits(olgm.herald.Source, olgm.herald.Herald);


/**
 * Watch the layer. This adds the layer to the list of layers the herald is
 * listening to, so that it can display it using Google Maps as soon as the
 * layer becomes visible.
 * @param {ol.layer.Base} layer layer to watch
 * @abstract
 * @api
 */
olgm.herald.Source.prototype.watchLayer = function(layer) {};


/**
 * Stop watching the layer. This removes the layer from the list of layers the
 * herald is listening to, and restores its original opacity.
 * @param {ol.layer.Base} layer layer to unwatch
 * @abstract
 * @api
 */
olgm.herald.Source.prototype.unwatchLayer = function(layer) {};


/**
 * Set the googleMapsIsActive value to true or false
 * @param {boolean} active whether or not google maps is active
 * @api
 */
olgm.herald.Source.prototype.setGoogleMapsActive = function(active) {
  this.googleMapsIsActive = active;
};


/**
 * Find the index of a layer in the ol3 map's layers
 * @param {ol.layer.Base} layer layer to find in ol3's layers array
 * @returns {number} suggested zIndex for that layer
 * @api
 */
olgm.herald.Source.prototype.findIndex = function(layer) {
  var layers = this.ol3map.getLayers().getArray();
  var layerIndex = layers.indexOf(layer);
  var zIndex = layer.getZIndex();

  if (zIndex != 0) {
    layerIndex = zIndex;
  }

  return layerIndex;
};
