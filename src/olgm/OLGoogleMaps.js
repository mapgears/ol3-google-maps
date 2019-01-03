/**
 * @module olgm/OLGoogleMaps
 */
import Abstract from './Abstract.js';
import LayersHerald from './herald/Layers.js';
import {assign} from './obj.js';

/**
 * @typedef {Object} Options
 * @property {module:ol/PluggableMap} map The OpenLayers map.
 * @property {module:olgm/gm/MapIcon~Options} [mapIconOptions] Options for the MapIcon object if it exists
 * @property {module:olgm/herald/Herald~WatchOptions} [watch] For each layer type, a boolean indicating whether the library should watch and let layers of that type should be rendered by Google Maps or not. Defaults to `true` for each option.
 * @property {google.maps.MapOptions} [gmapOptions] Options for the gmap to override the defaults
 */

/**
 * @classdesc
 * The main component of this library. It binds an existing OpenLayers map to
 * a Google Maps map it creates through the use of `herald` objects. Each
 * herald is responsible of synchronizing something from the OpenLayers map
 * to the Google Maps one, which makes OpenLayers the master source of
 * interactions. This allows the development of applications without having
 * to worry about writing code that uses the Google Maps API.
 *
 * Here's an architecture overview of what the different heralds, where they
 * are created and on what they act:
 *
 *     olgm.OLGoogleMaps <-- ol.Map
 *      |
 *      |__olgm.herald.Layers <-- ol.Collection<ol.layer.Base>
 *         |                      |
 *         |                      |__olgm.layer.Google
 *         |                      |
 *         |                      |__ol.layer.Vector
 *         |                      |
 *         |                      |__ol.layer.TileLayer
 *         |                      |
 *         |                      |__ol.layer.ImageLayer
 *         |
 *         |__olgm.herald.View <-- ol.View
 *         |
 *         |__olgm.herald.TileSource <-- ol.source.Tile
 *         |
 *         |__olgm.herald.ImageWMSSource <-- ol.source.ImageWMS
 *         |
 *         |__olgm.herald.VectorSource <-- ol.source.Vector
 *            |
 *            |__olgm.herald.Feature <-- ol.Feature
 *
 * @api
 */
class OLGoogleMaps extends Abstract {
  /**
   * @param {module:olgm/OLGoogleMaps~Options} options Options.
   */
  constructor(options) {
    const gmapEl = document.createElement('div');
    gmapEl.style.height = 'inherit';
    gmapEl.style.width = 'inherit';

    const gmapOptions = assign({
      disableDefaultUI: true,
      disableDoubleClickZoom: true,
      draggable: false,
      keyboardShortcuts: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scrollwheel: false,
      streetViewControl: false
    }, options.gmapOptions);

    const gmap = new google.maps.Map(gmapEl, gmapOptions);

    super(options.map, gmap);

    /**
     * @type {Array<module:olgm/herald/Herald>}
     * @private
     */
    this.heralds_ = [];

    const watchOptions = options.watch !== undefined ?
      options.watch : {};

    const mapIconOptions = options.mapIconOptions !== undefined ?
      options.mapIconOptions : {};

    /**
     * @type {module:olgm/herald/Layers}
     * @private
     */
    this.layersHerald_ = new LayersHerald(
      this.ol3map, this.gmap, mapIconOptions, watchOptions);
    this.heralds_.push(this.layersHerald_);

    /**
     * @type {boolean}
     * @private
     */
    this.active_ = false;
  }

  /**
   * @api
   */
  activate() {

    if (this.active_) {
      return;
    }

    // activate heralds
    for (let i = 0, len = this.heralds_.length; i < len; i++) {
      this.heralds_[i].activate();
    }

    this.active_ = true;
  }


  /**
   * @api
   */
  deactivate() {

    if (!this.active_) {
      return;
    }

    // deactivate heralds
    for (let i = 0, len = this.heralds_.length; i < len; i++) {
      this.heralds_[i].deactivate();
    }

    this.active_ = false;
  }


  /**
   * @return {boolean} whether or not google maps is active
   * @api
   */
  getGoogleMapsActive() {
    return this.active_ && this.layersHerald_.getGoogleMapsActive();
  }


  /**
   * @return {google.maps.Map} the google maps map
   * @api
   */
  getGoogleMapsMap() {
    return this.gmap;
  }


  /**
   * Set the watch options
   * @param {module:olgm/herald/Herald~WatchOptions} watchOptions whether each layer type
   * should be watched
   * @api
   */
  setWatchOptions(watchOptions) {
    const newWatchOptions = watchOptions !== undefined ? watchOptions : {};
    this.layersHerald_.setWatchOptions(newWatchOptions);
  }


  /**
   * @api
   */
  toggle() {
    if (this.active_) {
      this.deactivate();
    } else {
      this.activate();
    }
  }


  /**
   * Trigger the layer ordering functions in the heralds. We listen for layers
   * added and removed, which usually happens when we change the order of the
   * layers in OL3, but this function allows refreshing it manually in case
   * the order is being change in another way.
   * @api
   */
  orderLayers() {
    this.layersHerald_.orderLayers();
  }


  /**
   * Refresh layers and features that might need it (only ImageWMS so far)
   * @api
   */
  refresh() {
    this.layersHerald_.refresh();
  }
}


export default OLGoogleMaps;
