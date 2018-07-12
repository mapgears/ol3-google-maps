/**
 * @module olgm/herald/Herald
 */
import {inherits} from 'ol/index.js';
import {unlistenAllByKey} from '../util.js';
import Abstract from '../Abstract.js';

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
const Herald = function(ol3map, gmap) {

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

  Abstract.call(this, ol3map, gmap);
};

inherits(Herald, Abstract);


/**
 * Register all event listeners.
 */
Herald.prototype.activate = function() {};


/**
 * Unregister all event listeners.
 */
Herald.prototype.deactivate = function() {
  unlistenAllByKey(this.listenerKeys, this.olgmListenerKeys);
};
export default Herald;
