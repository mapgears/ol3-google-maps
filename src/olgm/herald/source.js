/**
 * @module olgm/herald/Source
 */
import Herald from './Herald.js';

class SourceHerald extends Herald {
  /**
   * This is an abstract class. Children of this class will listen to one or
   * multiple layers of a specific class to render them using the Google Maps
   * API whenever a Google Maps layer is active.
   * @param {module:ol/PluggableMap} ol3map openlayers map
   * @param {google.maps.Map} gmap google maps map
   * @abstract
   */
  constructor(ol3map, gmap) {
    super(ol3map, gmap);

    /**
     * Flag that determines whether the GoogleMaps map is currently active, i.e.
     * is currently shown and has the OpenLayers map added as one of its control.
     * @type {boolean}
     * @protected
     */
    this.googleMapsIsActive_ = false;
  }


  /**
   * Watch the layer. This adds the layer to the list of layers the herald is
   * listening to, so that it can display it using Google Maps as soon as the
   * layer becomes visible.
   * @param {module:ol/layer/Base} layer layer to watch
   * @abstract
   * @api
   */
  watchLayer(layer) {}


  /**
   * Stop watching the layer. This removes the layer from the list of layers the
   * herald is listening to, and restores its original opacity.
   * @param {module:ol/layer/Base} layer layer to unwatch
   * @abstract
   * @api
   */
  unwatchLayer(layer) {}


  /**
   * Set the googleMapsIsActive value to true or false
   * @param {boolean} active whether or not google maps is active
   * @api
   */
  setGoogleMapsActive(active) {
    this.googleMapsIsActive = active;
  }


  /**
   * Find the index of a layer in the ol3 map's layers
   * @param {module:ol/layer/Base} layer layer to find in ol3's layers array
   * @returns {number} suggested zIndex for that layer
   * @api
   */
  findIndex(layer) {
    const layers = this.ol3map.getLayers().getArray();
    let layerIndex = layers.indexOf(layer);
    const zIndex = layer.getZIndex();

    if (zIndex != 0) {
      layerIndex = zIndex;
    }

    return layerIndex;
  }
}
export default SourceHerald;
