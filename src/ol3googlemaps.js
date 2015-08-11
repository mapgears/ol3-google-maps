goog.provide('olgm.OLGoogleMaps');



/**
 * @param {!olgmx.OLGoogleMapsOptions} options Options.
 * @constructor
 * @api
 */
olgm.OLGoogleMaps = function(options) {

  /**
   * @type {!ol.Map}
   * @private
   */
  this.ol3map_ = options.ol3map;

  /**
   * @type {!google.maps.Map}
   * @private
   */
  this.gmap_ = options.gmap;

  console.log(this.ol3map_);
  console.log(this.gmap_);

};
