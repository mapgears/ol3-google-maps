/**
 * @module olgm/layer/Google
 */
import TileLayer from 'ol/layer/Tile.js';

/**
 * @typedef {Object} Options
 * @property {boolean} [visible=true] Visibility.
 * @property {google.maps.MapTypeId<(number|string)>|string|undefined} [mapTypeId=google.maps.MapTypeId.ROADMAP] The type of google map
 * @property {Array<google.maps.MapTypeStyle>|undefined} [styles] Google map styling
 */

/**
 * @classdesc
 * An ol3 layer object serving the purpose of being added to the ol3 map
 * as dummy layer. The `mapTypeId` defines which Google Maps map type the
 * layer represents.
 * @api
 */
class GoogleLayer extends TileLayer {
  /**
   * @param {module:olgm/layer/Google~Options} opt_options Layer options.
   */
  constructor(opt_options) {
    const options = opt_options ? opt_options : {};
    super(options);

    /**
     * @type {google.maps.MapTypeId<(number|string)>|string}
     * @private
     */
    this.mapTypeId_ = options.mapTypeId !== undefined ? options.mapTypeId :
      google.maps.MapTypeId.ROADMAP;

    /**
     * @type {?Array<google.maps.MapTypeStyle>}
     * @private
     */
    this.styles_ = options.styles ? options.styles : null;
  }


  /**
   * @return {google.maps.MapTypeId<(number|string)>|string} map type id
   * @api
   */
  getMapTypeId() {
    return this.mapTypeId_;
  }


  /**
   * @return {?Array<google.maps.MapTypeStyle>} map styles
   */
  getStyles() {
    return this.styles_;
  }
}
export default GoogleLayer;
