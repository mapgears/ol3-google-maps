goog.provide('olgm.herald.Herald');

goog.require('olgm');
goog.require('olgm.Abstract');



/**
 * Abstract class for all heralds. When activated, an herald synchronizes
 * something from the OpenLayers map to the Google Maps one. When deactivated,
 * it stops doing so.
 *
 * @param {!ol.Map} ol3map
 * @param {!google.maps.Map} gmap
 * @constructor
 * @extends {olgm.Abstract}
 */
olgm.herald.Herald = function(ol3map, gmap) {

  /**
   * @type {Array.<ol.events.Key|Array.<ol.events.Key>>}
   * @protected
   */
  this.listenerKeys = [];

  /**
   * @type {Array.<goog.events.Key>}
   * @protected
   */
  this.googListenerKeys = [];

  goog.base(this, ol3map, gmap);
};
goog.inherits(olgm.herald.Herald, olgm.Abstract);


/**
 * Register all event listeners.
 */
olgm.herald.Herald.prototype.activate = function() {};


/**
 * Unregister all event listeners.
 */
olgm.herald.Herald.prototype.deactivate = function() {
  olgm.unlistenAllByKey(this.listenerKeys, this.googListenerKeys);
};
