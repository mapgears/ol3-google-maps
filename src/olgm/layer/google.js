/**
 * @module olgm/layer/Google
 */
import LayerGroup from 'ol/layer/Group.js';

class GoogleLayer extends LayerGroup {
  /**
   * An ol3 layer object serving the purpose of being added to the ol3 map
   * as dummy layer. The `mapTypeId` defines which Google Maps map type the
   * layer represents.
   *
   * @param {!olgmx.layer.GoogleOptions=} opt_options Options.
   * @api
   */
  constructor(opt_options) {
    super(opt_options);
    const options = opt_options !== undefined ? opt_options : {};

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

  }


  /**
   * @return {google.maps.MapTypeId.<(number|string)>|string} map type id
   * @api
   */
  getMapTypeId() {
    return this.mapTypeId_;
  }


  /**
   * @return {?Array.<google.maps.MapTypeStyle>} map styles
   */
  getStyles() {
    return this.styles_;
  }
}
export default GoogleLayer;
