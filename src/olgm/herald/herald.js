goog.provide('olgm.herald.Herald');

goog.require('ol');
goog.require('olgm');
goog.require('olgm.Abstract');


/**
 * Abstract class for all heralds. When activated, an herald synchronizes
 * something from the OpenLayers map to the Google Maps one. When deactivated,
 * it stops doing so.
 *
 * @param {!ol.Map} ol3map openlayers map
 * @param {!google.maps.Map} gmap google maps map
 * @constructor
 * @extends {olgm.Abstract}
 */
olgm.herald.Herald = function(ol3map, gmap) {

  /**
   * @type {Array.<ol.EventsKey|Array.<ol.EventsKey>>}
   * @protected
   */
  this.listenerKeys = [];

  /**
   * @type {Array.<ol.EventsKey>}
   * @protected
   */
  this.olgmListenerKeys = [];

  olgm.Abstract.call(this, ol3map, gmap);
};
ol.inherits(olgm.herald.Herald, olgm.Abstract);


/**
 * Register all event listeners.
 */
olgm.herald.Herald.prototype.activate = function() {};


/**
 * Unregister all event listeners.
 */
olgm.herald.Herald.prototype.deactivate = function() {
  olgm.unlistenAllByKey(this.listenerKeys, this.olgmListenerKeys);
};
