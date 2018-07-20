/**
 * @module olgm/Abstract
 */
class Abstract {
  /**
   * @classdesc
   * Abstract class for most classes of this library, which receives a reference
   * to the `google.maps.Map` and {@link module:ol/PluggableMap} objects and behave accordingly with
   * them.
   *
   * @param {module:ol/PluggableMap} ol3map openlayers map
   * @param {google.maps.Map} gmap google maps map
   */
  constructor(ol3map, gmap) {
    /**
     * @type {module:ol/PluggableMap}
     * @protected
     */
    this.ol3map = ol3map;

    /**
     * @type {!google.maps.Map}
     * @protected
     */
    this.gmap = gmap;
  }
}
export default Abstract;
