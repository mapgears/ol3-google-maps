/**
 * @module olgm/herald/Layers
 */
import {inherits} from 'ol/index.js';
import Image from 'ol/layer/Image.js';
import Tile from 'ol/layer/Tile.js';
import Vector from 'ol/layer/Vector.js';
import {unlistenAllByKey} from '../util.js';
import Herald from './Herald.js';
import ImageWMSSource from './ImageWMSSource.js';
import TileSource from './TileSource.js';
import VectorSource from './VectorSource.js';
import View from './View.js';
import Google from '../layer/Google.js';

/**
 * The Layers Herald is responsible of synchronizing the layers from the
 * OpenLayers map to the Google Maps one. It listens to layers added and
 * removed, and also takes care of existing layers when activated.
 *
 * It is also responsible of the activation and deactivation of the
 * Google Maps map. When activated, it is rendered in the OpenLayers map
 * target element, and the OpenLayers map is put inside the Google Maps map
 * as a control that takes 100% of the size. The original state is restored
 * when deactivated.
 *
 * The supported layers are:
 *
 * `olgm.layer.Google`
 * -------------------
 *     When a google layer is added, the process of enabling the
 *     Google Maps  map is activated (if it is the first and if it's visible).
 *     If there is an existing and visible `olgm.layer.Google` in the map,
 *     then the top-most is used to define the map type id Google Maps has to
 *     switch to. **Limitation** The Google Maps map is always below the
 *     OpenLayers map, which means that the other OpenLayers layers are always
 *     on top of Google Maps.
 *
 * `ol.layer.Vector`
 * -----------------
 *     When a vector layers is added, a `olgm.herald.VectorFeature` is created
 *     to manage its `ol.source.Vector`. The layer is immediately rendered
 *     fully transparent, making the interactions still possible over it
 *     while being invisible.
 *
 * @param {!ol.Map} ol3map openlayers map
 * @param {!google.maps.Map} gmap google maps map
 * @param {olgmx.gm.MapIconOptions} mapIconOptions map icon options
 * @param {olgmx.herald.WatchOptions} watchOptions for each layer,
 * whether we should watch that type of layer or not
 * @constructor
 * @extends {olgm.herald.Herald}
 */
const Layers = function(ol3map, gmap, mapIconOptions, watchOptions) {

  /**
   * @type {Array.<olgm.layer.Google>}
   * @private
   */
  this.googleLayers_ = [];

  /**
   * @type {Array.<olgm.herald.Layers.GoogleLayerCache>}
   * @private
   */
  this.googleCache_ = [];

  /**
   * @type {olgm.herald.ImageWMSSource}
   * @private
   */
  this.imageWMSSourceHerald_ = new ImageWMSSource(ol3map, gmap);

  /**
   * @type {olgm.herald.TileSource}
   * @private
   */
  this.tileSourceHerald_ = new TileSource(ol3map, gmap);

  /**
   * @type {olgm.herald.VectorSource}
   * @private
   */
  this.vectorSourceHerald_ = new VectorSource(
    ol3map, gmap, mapIconOptions);

  /**
   * @type {olgm.herald.View}
   * @private
   */
  this.viewHerald_ = new View(ol3map, gmap);

  /**
   * @type {olgmx.herald.WatchOptions}
   * @private
   */
  this.watchOptions_ = watchOptions;


  // === Elements  === //

  /**
   * @type {Node}
   * @private
   */
  this.gmapEl_ = gmap.getDiv();

  /**
   * @type {Element}
   * @private
   */
  this.ol3mapEl_ = ol3map.getViewport();

  /**
   * @type {Element}
   * @private
   */
  this.targetEl_ = ol3map.getTargetElement();


  Herald.call(this, ol3map, gmap);


  // some controls, like the ol.control.ZoomSlider, require the map div
  // to have a size. While activating Google Maps, the size of the ol3 map
  // becomes moot. The code below fixes that.
  const center = this.ol3map.getView().getCenter();
  if (!center) {
    this.ol3map.getView().once('change:center', () => {
      this.ol3map.once('postrender', () => {
        this.ol3mapIsRenderered_ = true;
        this.toggleGoogleMaps_();
      });
      this.toggleGoogleMaps_();
    });
  } else {
    this.ol3map.once('postrender', () => {
      this.ol3mapIsRenderered_ = true;
      this.toggleGoogleMaps_();
    });
  }
};

inherits(Layers, Herald);


/**
 * Flag that determines whether the GoogleMaps map is currently active, i.e.
 * is currently shown and has the OpenLayers map added as one of its control.
 * @type {boolean}
 * @private
 */
Layers.prototype.googleMapsIsActive_ = false;


/**
 * @type {boolean}
 * @private
 */
Layers.prototype.ol3mapIsRenderered_ = false;


/**
 * @inheritDoc
 */
Layers.prototype.activate = function() {

  Herald.prototype.activate.call(this);

  const layers = this.ol3map.getLayers();

  // watch existing layers
  layers.forEach((layer) => this.watchLayer_(layer));

  // event listeners
  const keys = this.listenerKeys;
  keys.push(layers.on('add', (event) => this.handleLayersAdd_(event)));
  keys.push(layers.on('remove', (event) => this.handleLayersRemove_(event)));
};


/**
 * @inheritDoc
 */
Layers.prototype.deactivate = function() {
  // unwatch existing layers
  this.ol3map.getLayers().forEach((layer) => this.unwatchLayer_(layer));

  Herald.prototype.deactivate.call(this);
};


/**
 * @return {boolean} whether google maps is active or not
 */
Layers.prototype.getGoogleMapsActive = function() {
  return this.googleMapsIsActive_;
};


/**
 * Set the googleMapsIsActive value and spread the change to the heralds
 * @param {boolean} active value to update the google maps active flag with
 * @private
 */
Layers.prototype.setGoogleMapsActive_ = function(active) {
  this.googleMapsIsActive_ = active;
  this.imageWMSSourceHerald_.setGoogleMapsActive(active);
  this.tileSourceHerald_.setGoogleMapsActive(active);
  this.vectorSourceHerald_.setGoogleMapsActive(active);
};


/**
 * Set the watch options
 * @param {olgmx.herald.WatchOptions} watchOptions whether each layer type
 * should be watched
 * @api
 */
Layers.prototype.setWatchOptions = function(watchOptions) {
  this.watchOptions_ = watchOptions;

  // Re-watch the appropriate layers
  this.deactivate();
  this.activate();
};


/**
 * Callback method fired when a new layer is added to the map.
 * @param {ol.Collection.Event} event Collection event.
 * @private
 */
Layers.prototype.handleLayersAdd_ = function(event) {
  const layer = /** @type {ol.layer.Base} */ (event.element);
  this.watchLayer_(layer);
  this.orderLayers();
};


/**
 * Callback method fired when a layer is removed from the map.
 * @param {ol.Collection.Event} event Collection event.
 * @private
 */
Layers.prototype.handleLayersRemove_ = function(event) {
  const layer = /** @type {ol.layer.Base} */ (event.element);
  this.unwatchLayer_(layer);
  this.orderLayers();
};


/**
 * Watch the layer
 * @param {ol.layer.Base} layer layer to watch
 * @private
 */
Layers.prototype.watchLayer_ = function(layer) {
  if (layer instanceof Google) {
    this.watchGoogleLayer_(layer);
  } else if (layer instanceof Vector &&
        this.watchOptions_.vector !== false) {
    this.vectorSourceHerald_.watchLayer(layer);
  } else if (layer instanceof Tile &&
        this.watchOptions_.tile !== false) {
    this.tileSourceHerald_.watchLayer(layer);
  } else if (layer instanceof Image &&
        this.watchOptions_.image !== false) {
    this.imageWMSSourceHerald_.watchLayer(layer);
  }
};


/**
 * Watch the google layer
 * @param {olgm.layer.Google} layer google layer to watch
 * @private
 */
Layers.prototype.watchGoogleLayer_ = function(layer) {
  this.googleLayers_.push(layer);
  this.googleCache_.push(/** @type {olgm.herald.Layers.GoogleLayerCache} */ ({
    layer: layer,
    listenerKeys: [
      layer.on('change:visible', () => this.toggleGoogleMaps_())
    ]
  }));
  this.toggleGoogleMaps_();
};


/**
 * Unwatch the layer
 * @param {ol.layer.Base} layer layer to unwatch
 * @private
 */
Layers.prototype.unwatchLayer_ = function(layer) {
  if (layer instanceof Google) {
    this.unwatchGoogleLayer_(layer);
  } else if (layer instanceof Vector) {
    this.vectorSourceHerald_.unwatchLayer(layer);
  } else if (layer instanceof Tile) {
    this.tileSourceHerald_.unwatchLayer(layer);
  } else if (layer instanceof Image) {
    this.imageWMSSourceHerald_.unwatchLayer(layer);
  }
};


/**
 * Unwatch the google layer
 * @param {olgm.layer.Google} layer google layer to unwatch
 * @private
 */
Layers.prototype.unwatchGoogleLayer_ = function(layer) {
  const index = this.googleLayers_.indexOf(layer);
  if (index !== -1) {
    this.googleLayers_.splice(index, 1);

    const cacheItem = this.googleCache_[index];
    unlistenAllByKey(cacheItem.listenerKeys);

    this.googleCache_.splice(index, 1);

    this.toggleGoogleMaps_();
  }
};


/**
 * Activates the GoogleMaps map, i.e. put it in the ol3 map target and put
 * the ol3 map inside the gmap controls.
 * @private
 */
Layers.prototype.activateGoogleMaps_ = function() {

  const center = this.ol3map.getView().getCenter();
  if (this.googleMapsIsActive_ || !this.ol3mapIsRenderered_ || !center) {
    return;
  }

  this.targetEl_.removeChild(this.ol3mapEl_);
  this.targetEl_.appendChild(this.gmapEl_);
  const index = parseInt(google.maps.ControlPosition.TOP_LEFT, 10);
  this.gmap.controls[index].push(
    this.ol3mapEl_);

  this.viewHerald_.activate();

  // the map div of GoogleMaps doesn't like being tossed aroud. The line
  // below fixes the UI issue of wrong size of the tiles of GoogleMaps
  google.maps.event.trigger(this.gmap, 'resize');

  // it's also possible that the google maps map is not exactly at the
  // correct location. Fix this manually here
  this.viewHerald_.setCenter();
  this.viewHerald_.setRotation();
  this.viewHerald_.setZoom();

  this.setGoogleMapsActive_(true);

  // activate all cache items
  this.imageWMSSourceHerald_.activate();
  this.tileSourceHerald_.activate();
  this.vectorSourceHerald_.activate();

  this.orderLayers();
};


/**
 * Deactivates the GoogleMaps map, i.e. put the ol3 map back in its target
 * and remove the gmap map.
 * @private
 */
Layers.prototype.deactivateGoogleMaps_ = function() {

  if (!this.googleMapsIsActive_) {
    return;
  }

  const index = parseInt(google.maps.ControlPosition.TOP_LEFT, 10);
  this.gmap.controls[index].removeAt(0);
  this.targetEl_.removeChild(this.gmapEl_);
  this.targetEl_.appendChild(this.ol3mapEl_);

  this.viewHerald_.deactivate();

  this.ol3mapEl_.style.position = 'relative';

  // deactivate all cache items
  this.imageWMSSourceHerald_.deactivate();
  this.tileSourceHerald_.deactivate();
  this.vectorSourceHerald_.deactivate();

  this.setGoogleMapsActive_(false);
};


/**
 * This method takes care of activating or deactivating the GoogleMaps map.
 * It is activated if at least one visible Google layer is currently in the
 * ol3 map (and vice-versa for deactivation). The top-most layer is used
 * to determine that. It is also used to change the GoogleMaps mapTypeId
 * accordingly too to fit the top-most ol3 Google layer.
 * @private
 */
Layers.prototype.toggleGoogleMaps_ = function() {

  let found = null;

  // find top-most Google layer
  this.ol3map.getLayers().getArray().slice(0).reverse().every(
    function(layer) {
      if (layer instanceof Google &&
            layer.getVisible() &&
            this.googleLayers_.indexOf(layer) !== -1) {
        found = layer;
        return false;
      } else {
        return true;
      }
    },
    this);

  if (found) {
    // set mapTypeId
    this.gmap.setMapTypeId(found.getMapTypeId());
    // set styles
    const styles = found.getStyles();
    if (styles) {
      this.gmap.setOptions({'styles': styles});
    } else {
      this.gmap.setOptions({'styles': null});
    }

    // activate
    this.activateGoogleMaps_();
  } else {
    // deactivate
    this.deactivateGoogleMaps_();
  }
};


/**
 * Order the layers for each herald that supports it
 * @api
 */
Layers.prototype.orderLayers = function() {
  this.imageWMSSourceHerald_.orderLayers();
  this.tileSourceHerald_.orderLayers();
};


/**
 * For each layer type that support refreshing, tell them to refresh
 * @api
 */
Layers.prototype.refresh = function() {
  this.imageWMSSourceHerald_.refresh();
};


/**
 * @typedef {{
 *   layer: (olgm.layer.Google),
 *   listenerKeys: (Array.<ol.EventsKey|Array.<ol.EventsKey>>)
 * }}
 */
Layers.GoogleLayerCache;
export default Layers;
