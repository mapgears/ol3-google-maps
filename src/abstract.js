goog.provide('olgm.Abstract');


/**
 * Abstract class for most classes of this library, which receives a reference
 * to the `google.maps.Map` and `ol.Map` objects an behave accordingly with
 * them.
 *
 * @param {!ol.Map} ol3map openlayers map
 * @param {!google.maps.Map} gmap google maps map
 * @constructor
 */
olgm.Abstract = function(ol3map, gmap) {

  /**
   * @type {!ol.Map}
   * @protected
   */
  this.ol3map = ol3map;

  /**
   * @type {!google.maps.Map}
   * @protected
   */
  this.gmap = gmap;

};
