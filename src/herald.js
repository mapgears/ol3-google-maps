// FIXME - deactivate doesn't work with ol.js, but works with ol-debug.js
goog.provide('olgm.Herald');

goog.require('goog.array');
goog.require('goog.events');
goog.require('olgm.Abstract');



/**
 * Abstract class for all heralds. An herald is responsible of synchronizing
 * something between the OpenLayers and Google Maps maps, whether by
 * using event listeners or manually.
 *
 * The `switchMap` is the method used when the herald has to manually
 * do something when one of the two maps become active.
 *
 * The `activate` and `deactivate` methods used to make the herald
 * register and unregister events.
 *
 * An herald can use a single or both of the above methods.
 *
 * @param {!ol.Map} ol3map
 * @param {!google.maps.Map} gmap
 * @constructor
 * @extends {olgm.Abstract}
 * @api
 */
olgm.Herald = function(ol3map, gmap) {

  /**
   * @type {Array.<goog.events.Key>}
   * @protected
   */
  this.listenerKeys = [];

  goog.base(this, ol3map, gmap);
};
goog.inherits(olgm.Herald, olgm.Abstract);


/**
 * Register all event listeners.
 * @api
 */
olgm.Herald.prototype.activate = function() {};


/**
 * Unregister all event listeners.
 * @api
 */
olgm.Herald.prototype.deactivate = function() {
  goog.array.forEach(this.listenerKeys, goog.events.unlistenByKey);
  this.listenerKeys.length = 0;
};


/**
 * Called when switching to a particular map.
 * @param {string} mapType
 * @api
 */
olgm.Herald.prototype.switchMap = function(mapType) {};
