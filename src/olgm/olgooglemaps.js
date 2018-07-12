/**
 * @module olgm/OLGoogleMaps
 */
import {inherits} from 'ol/index.js';
import Abstract from './Abstract.js';
import Layers from './herald/Layers.js';

/**
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
 *
 * olgm.OLGoogleMaps <-- ol.Map
 *  |
 *  |__ olgm.herald.Layers <-- ol.Collection.<ol.layer.Base>
 *       |                      |
 *       |                      |__olgm.layer.Google
 *       |                      |
 *       |                      |__ol.layer.Vector
 *       |
 *       |__olgm.herald.View <-- ol.View
 *       |
 *       |__olgm.herald.VectorSource <-- ol.source.Vector
 *          |
 *          |__olgm.herald.Feature <-- ol.Feature
 *
 *
 *
 * @param {!olgmx.OLGoogleMapsOptions} options Options.
 * @constructor
 * @extends {olgm.Abstract}
 * @api
 */
const OLGoogleMaps = function(options) {

  /**
   * @type {Array.<olgm.herald.Herald>}
   * @private
   */
  this.heralds_ = [];

  const gmapEl = document.createElement('div');
  gmapEl.style.height = 'inherit';
  gmapEl.style.width = 'inherit';

  const gmap = new google.maps.Map(gmapEl, {
    disableDefaultUI: true,
    disableDoubleClickZoom: true,
    draggable: false,
    keyboardShortcuts: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: false,
    streetViewControl: false
  });

  Abstract.call(this, options.map, gmap);

  const watchOptions = options.watch !== undefined ?
    options.watch : {};

  const mapIconOptions = options.mapIconOptions !== undefined ?
    options.mapIconOptions : {};

  /**
   * @type {olgm.herald.Layers}
   * @private
   */
  this.layersHerald_ = new Layers(
    this.ol3map, this.gmap, mapIconOptions, watchOptions);
  this.heralds_.push(this.layersHerald_);
};

inherits(OLGoogleMaps, Abstract);


/**
 * @type {boolean}
 * @private
 */
OLGoogleMaps.prototype.active_ = false;


/**
 * @api
 */
OLGoogleMaps.prototype.activate = function() {

  if (this.active_) {
    return;
  }

  // activate heralds
  for (let i = 0, len = this.heralds_.length; i < len; i++) {
    this.heralds_[i].activate();
  }

  this.active_ = true;
};


/**
 * @api
 */
OLGoogleMaps.prototype.deactivate = function() {

  if (!this.active_) {
    return;
  }

  // deactivate heralds
  for (let i = 0, len = this.heralds_.length; i < len; i++) {
    this.heralds_[i].deactivate();
  }

  this.active_ = false;
};


/**
 * @return {boolean} whether or not google maps is active
 * @api
 */
OLGoogleMaps.prototype.getGoogleMapsActive = function() {
  return this.active_ && this.layersHerald_.getGoogleMapsActive();
};


/**
 * @return {google.maps.Map} the google maps map
 * @api
 */
OLGoogleMaps.prototype.getGoogleMapsMap = function() {
  return this.gmap;
};


/**
 * Set the watch options
 * @param {olgmx.herald.WatchOptions} watchOptions whether each layer type
 * should be watched
 * @api
 */
OLGoogleMaps.prototype.setWatchOptions = function(watchOptions) {
  const newWatchOptions = watchOptions !== undefined ? watchOptions : {};
  this.layersHerald_.setWatchOptions(newWatchOptions);
};


/**
 * @api
 */
OLGoogleMaps.prototype.toggle = function() {
  if (this.active_) {
    this.deactivate();
  } else {
    this.activate();
  }
};


/**
 * Trigger the layer ordering functions in the heralds. We listen for layers
 * added and removed, which usually happens when we change the order of the
 * layers in OL3, but this function allows refreshing it manually in case
 * the order is being change in another way.
 * @api
 */
OLGoogleMaps.prototype.orderLayers = function() {
  this.layersHerald_.orderLayers();
};


/**
 * Refresh layers and features that might need it (only ImageWMS so far)
 * @api
 */
OLGoogleMaps.prototype.refresh = function() {
  this.layersHerald_.refresh();
};
export default OLGoogleMaps;
