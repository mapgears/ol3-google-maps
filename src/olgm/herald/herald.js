/**
 * @module olgm/herald/Herald
 */
import {unlistenAllByKey} from '../util.js';
import Abstract from '../Abstract.js';

class Herald extends Abstract {
  /**
   * Abstract class for all heralds. When activated, an herald synchronizes
   * something from the OpenLayers map to the Google Maps one. When deactivated,
   * it stops doing so.
   *
   * @param {!ol.Map} ol3map openlayers map
   * @param {!google.maps.Map} gmap google maps map
   */
  constructor(ol3map, gmap) {
    super(ol3map, gmap);

    /**
     * @type {Array.<ol.EventsKey|Array.<ol.EventsKey>>}
     * @protected
     */
    this.listenerKeys = [];

    /**
     * @type {Array.<ol.EventsKey>}
     * @protected
     */
    this.olgmListenerKeys = [];
  }


  /**
   * Register all event listeners.
   */
  activate() {}


  /**
   * Unregister all event listeners.
   */
  deactivate() {
    unlistenAllByKey(this.listenerKeys, this.olgmListenerKeys);
  }
}
export default Herald;
