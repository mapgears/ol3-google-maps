/**
 * @module olgm/herald/Herald
 */
import Abstract from '../Abstract.js';

/**
 * @typedef {Object} WatchOptions
 * @property {boolean} [image=true] Whether to watch image layers or not
 * @property {boolean} [tile=true] Whether to watch tile layers or not
 * @property {boolean} [vector=true] Whether to watch vector layers or not
 */

class Herald extends Abstract {
  /**
   * Abstract class for all heralds. When activated, an herald synchronizes
   * something from the OpenLayers map to the Google Maps one. When deactivated,
   * it stops doing so.
   *
   * @param {module:ol/PluggableMap} ol3map openlayers map
   * @param {google.maps.Map} gmap google maps map
   */
  constructor(ol3map, gmap) {
    super(ol3map, gmap);

    /**
     * @type {module:olgm/AbstractListener~AbstractListener|null}
     * @protected
     */
    this.listener = null;
  }


  /**
   * Register all event listeners.
   */
  activate() {}


  /**
   * Unregister all event listeners.
   */
  deactivate() {
    if (this.listener) {
      this.listener.unlisten();
    }
  }
}
export default Herald;
