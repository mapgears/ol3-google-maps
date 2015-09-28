goog.provide('olgm.layer.Google');

//goog.require('ol.layer.Group');



/**
 * An ol3 layer object serving the purpose of being added to the ol3 map
 * as dummy layer.
 *
 * @param {!olgmx.layer.GoogleOptions} options Options.
 * @constructor
 * @extends {ol.layer.Group}
 * @api
 */
olgm.layer.Google = function(options) {

  /**
   * @type {string}
   * @private
   */
  this.mapTypeId_ = options.mapTypeId;

  goog.base(this, /** @type {olx.layer.GroupOptions} */ (options));

};
goog.inherits(olgm.layer.Google, ol.layer.Group);


/**
 * @return {string}
 */
olgm.layer.Google.prototype.getMapTypeId = function() {
  return this.mapTypeId_;
};
