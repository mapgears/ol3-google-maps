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
  this.map_ = options.map;

  console.log(this.map_);

};
