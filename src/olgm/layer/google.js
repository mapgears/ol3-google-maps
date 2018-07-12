/**
 * @module olgm/layer/Google
 */
import {inherits} from 'ol/index.js';
import Group from 'ol/layer/Group.js';

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
const Google = function(opt_options) {

  const options = opt_options !== undefined ? opt_options : {};

  Group.call(this, /** @type {olx.layer.GroupOptions} */ (options));

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

inherits(Google, Group);


/**
 * @return {google.maps.MapTypeId.<(number|string)>|string} map type id
 * @api
 */
Google.prototype.getMapTypeId = function() {
  return this.mapTypeId_;
};


/**
 * @return {?Array.<google.maps.MapTypeStyle>} map styles
 */
Google.prototype.getStyles = function() {
  return this.styles_;
};
export default Google;
