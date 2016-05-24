goog.provide('olgm.layer.Google');



/**
 * An ol3 layer object serving the purpose of being added to the ol3 map
 * as dummy layer. The `mapTypeId` defines which Google Maps map type the
 * layer represents.
 *
 * @param {!olgmx.layer.GoogleOptions=} opt_options Options.
 * @constructor
 * @extends {ol.layer.Group}
 * @api
 */
olgm.layer.Google = function(opt_options) {

  var options = opt_options !== undefined ? opt_options : {};

  goog.base(this, /** @type {olx.layer.GroupOptions} */ (options));

  /**
   * @type {google.maps.MapTypeId.<(number|string)>|string}
   * @private
   */
  this.mapTypeId_ = options.mapTypeId !== undefined ? options.mapTypeId :
      google.maps.MapTypeId.ROADMAP;

  /**
   * @type {?Array.<google.maps.MapTypeStyle>}
   * @private
   */
  this.styles_ = options.styles ? options.styles : null;

};
goog.inherits(olgm.layer.Google, ol.layer.Group);


/**
 * @return {google.maps.MapTypeId.<(number|string)>|string}
 * @api
 */
olgm.layer.Google.prototype.getMapTypeId = function() {
  return this.mapTypeId_;
};


/**
 * @return {?Array.<google.maps.MapTypeStyle>}
 */
olgm.layer.Google.prototype.getStyles = function() {
  return this.styles_;
};


/**
 * Set the visibility of the google layer (`true` or `false`). This is a
 * temporary fix for issue #60. The only thing different about this function,
 * which overrides the layerbase's setVisible function, is that it sends an
 * event manually right after.
 * We're doing this fix because for an unknown reason, when both OLGM and
 * OL3 are compiled and used at the same time, the layer's observable
 * properties don't fire change events anymore for the Google layer.
 * @param {boolean} visible The visibility of the layer.
 * @observable
 * @api stable
 */
olgm.layer.Google.prototype.setVisible = function(visible) {
  // Call the original setVisible function
  goog.base(this, 'setVisible', visible);

  // Dispatch a change event right after
  this.dispatchEvent('change:visible');
};
