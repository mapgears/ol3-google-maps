/**
 * @module olgm/herald/Source
 */
import {inherits} from 'ol/index.js';
import Herald from './Herald.js';

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
const Source = function(ol3map, gmap) {

  Herald.call(this, ol3map, gmap);

  /**
   * Flag that determines whether the GoogleMaps map is currently active, i.e.
   * is currently shown and has the OpenLayers map added as one of its control.
   * @type {boolean}
   * @protected
   */
  Source.prototype.googleMapsIsActive_ = false;
};

inherits(Source, Herald);


/**
 * Watch the layer. This adds the layer to the list of layers the herald is
 * listening to, so that it can display it using Google Maps as soon as the
 * layer becomes visible.
 * @param {ol.layer.Base} layer layer to watch
 * @abstract
 * @api
 */
Source.prototype.watchLayer = function(layer) {};


/**
 * Stop watching the layer. This removes the layer from the list of layers the
 * herald is listening to, and restores its original opacity.
 * @param {ol.layer.Base} layer layer to unwatch
 * @abstract
 * @api
 */
Source.prototype.unwatchLayer = function(layer) {};


/**
 * Set the googleMapsIsActive value to true or false
 * @param {boolean} active whether or not google maps is active
 * @api
 */
Source.prototype.setGoogleMapsActive = function(active) {
  this.googleMapsIsActive = active;
};


/**
 * Find the index of a layer in the ol3 map's layers
 * @param {ol.layer.Base} layer layer to find in ol3's layers array
 * @returns {number} suggested zIndex for that layer
 * @api
 */
Source.prototype.findIndex = function(layer) {
  const layers = this.ol3map.getLayers().getArray();
  let layerIndex = layers.indexOf(layer);
  const zIndex = layer.getZIndex();

  if (zIndex != 0) {
    layerIndex = zIndex;
  }

  return layerIndex;
};
export default Source;
