goog.provide('olgm.OLGoogleMaps');

goog.require('goog.asserts');
goog.require('olgm.Abstract');
goog.require('olgm.herald.Layers');
goog.require('olgm.herald.View');



/**
 * The main component of this library. It binds an OpenLayers map to a
 * GoogleMaps map and vice-versa.  It is responsible of creating the
 * sub-components that directly interact with both of the
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

  goog.base(this, options.ol3map, gmap);

  // create the heralds
  this.heralds_.push(new olgm.herald.Layers(this.ol3map, this.gmap));

  //this.heralds_.push(new olgm.herald.View(this.ol3map, this.gmap));

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
