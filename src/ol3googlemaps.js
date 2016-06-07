goog.provide('olgm.OLGoogleMaps');

goog.require('olgm.Abstract');
goog.require('olgm.herald.Layers');



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
olgm.OLGoogleMaps = function(options) {

  /**
   * @type {Array.<olgm.herald.Herald>}
   * @private
   */
  this.heralds_ = [];

  var gmapEl = document.createElement('div');
  gmapEl.style.height = 'inherit';
  gmapEl.style.width = 'inherit';

  var gmap = new google.maps.Map(gmapEl, {
    disableDefaultUI: true,
    disableDoubleClickZoom: true,
    draggable: false,
    keyboardShortcuts: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: false,
    streetViewControl: false
  });

  goog.base(this, options.map, gmap);

  var watchVector = options.watchVector !== undefined ?
      options.watchVector : true;

  /**
   * @type {olgm.herald.Layers}
   * @private
   */
  this.layersHerald_ = new olgm.herald.Layers(
      this.ol3map, this.gmap, watchVector);
  this.heralds_.push(this.layersHerald_);
};
goog.inherits(olgm.OLGoogleMaps, olgm.Abstract);


/**
 * @type {boolean}
 * @private
 */
olgm.OLGoogleMaps.prototype.active_ = false;


/**
 * @api
 */
olgm.OLGoogleMaps.prototype.activate = function() {

  if (this.active_) {
    return;
  }

  // activate heralds
  for (var i = 0, len = this.heralds_.length; i < len; i++) {
    this.heralds_[i].activate();
  }

  this.active_ = true;
};


/**
 * @api
 */
olgm.OLGoogleMaps.prototype.deactivate = function() {

  if (!this.active_) {
    return;
  }

  // deactivate heralds
  for (var i = 0, len = this.heralds_.length; i < len; i++) {
    this.heralds_[i].deactivate();
  }

  this.active_ = false;
};


/**
 * @return {boolean}
 * @api
 */
olgm.OLGoogleMaps.prototype.getGoogleMapsActive = function() {
  return this.active_ && this.layersHerald_.getGoogleMapsActive();
};


/**
 * @return {google.maps.Map}
 * @api
 */
olgm.OLGoogleMaps.prototype.getGoogleMapsMap = function() {
  return this.gmap;
};


/**
 * @api
 */
olgm.OLGoogleMaps.prototype.toggle = function() {
  if (this.active_) {
    this.deactivate();
  } else {
    this.activate();
  }
};
