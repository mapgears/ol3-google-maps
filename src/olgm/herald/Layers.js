/**
 * @module olgm/herald/Layers
 */
import ImageLayer from 'ol/layer/Image.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import Herald from './Herald.js';
import ImageWMSSourceHerald from './ImageWMSSource.js';
import TileSourceHerald from './TileSource.js';
import VectorSourceHerald from './VectorSource.js';
import ViewHerald from './View.js';
import GoogleLayer from '../layer/Google.js';
import PropertyListener from '../listener/PropertyListener.js';
import Listener from '../listener/Listener.js';

/**
 * @typedef {Object} GoogleLayerCache
 * @property {module:olgm/layer/Google} layer
 * @property {Array<module:olgm/AbstractListener~AbstractListener>} listeners
 */

class LayersHerald extends Herald {
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
   * * {@link module:olgm/layer/Google~GoogleLayer}:
   * When a google layer is added, the process of enabling the
   * Google Maps  map is activated (if it is the first and if it's visible).
   * If there is an existing and visible {@link module:olgm/layer/Google~GoogleLayer} in the map,
   * then the top-most is used to define the map type id Google Maps has to
   * switch to. **Limitation** The Google Maps map is always below the
   * OpenLayers map, which means that the other OpenLayers layers are always
   * on top of Google Maps.
   *
   * * {@link module:ol/layer/Vector~VectorLayer}:
   * When a vector layers is added, a {@link module:olgm/herald/VectorFeature~VectorFeatureHerald} is created
   * to manage its `ol.source.Vector`. The layer is immediately rendered
   * fully transparent, making the interactions still possible over it
   * while being invisible.
   *
   * @param {module:ol/PluggableMap} ol3map openlayers map
   * @param {google.maps.Map} gmap google maps map
   * @param {module:olgm/gm/MapIcon~Options} mapIconOptions map icon options
   * @param {module:olgm/herald/Herald~WatchOptions} watchOptions for each layer,
   * whether we should watch that type of layer or not
   */
  constructor(ol3map, gmap, mapIconOptions, watchOptions) {

    super(ol3map, gmap);

    /**
     * @type {Array<module:olgm/layer/Google>}
     * @private
     */
    this.googleLayers_ = [];

    /**
     * @type {Array<module:olgm/herald/Layers~GoogleLayerCache>}
     * @private
     */
    this.googleCache_ = [];

    /**
     * @type {module:olgm/herald/ImageWMSSource}
     * @private
     */
    this.imageWMSSourceHerald_ = new ImageWMSSourceHerald(ol3map, gmap);

    /**
     * @type {module:olgm/herald/TileSource}
     * @private
     */
    this.tileSourceHerald_ = new TileSourceHerald(ol3map, gmap);

    /**
     * @type {module:olgm/herald/VectorSource}
     * @private
     */
    this.vectorSourceHerald_ = new VectorSourceHerald(
      ol3map, gmap, mapIconOptions);

    /**
     * @type {module:olgm/herald/View}
     * @private
     */
    this.viewHerald_ = new ViewHerald(ol3map, gmap);

    /**
     * @type {module:olgm/herald/Herald~WatchOptions}
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
     * @type {HTMLElement}
     * @private
     */
    this.ol3mapEl_ = ol3map.getViewport();

    /**
     * @type {HTMLElement}
     * @private
     */
    this.targetEl_ = ol3map.getTargetElement();

    /**
     * Flag that determines whether the GoogleMaps map is currently active, i.e.
     * is currently shown and has the OpenLayers map added as one of its control.
     * @type {boolean}
     * @private
     */
    this.googleMapsIsActive_ = false;

    /**
     * @type {boolean}
     * @private
     */
    this.ol3mapIsRenderered_ = false;


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
  }


  /**
   * @inheritDoc
   */
  activate() {
    super.activate();

    this.listener = new PropertyListener(this.ol3map, null, 'layergroup', (layerGroup, oldLayerGroup) => {
      return new PropertyListener(layerGroup, oldLayerGroup, 'layers', (layers, oldLayers) => {
        if (oldLayers) {
          oldLayers.forEach(layer => this.unwatchLayer_(layer));
        }
        layers.forEach(layer => this.watchLayer_(layer));

        return new Listener([
          // watch existing layers
          layers.on('add', event => this.handleLayersAdd_(event)),
          layers.on('remove', event => this.handleLayersRemove_(event))
        ]);
      });
    });
  }


  /**
   * @inheritDoc
   */
  deactivate() {
    // unwatch existing layers
    this.ol3map.getLayers().forEach((layer) => this.unwatchLayer_(layer));

    super.deactivate();
  }


  /**
   * @return {boolean} whether google maps is active or not
   */
  getGoogleMapsActive() {
    return this.googleMapsIsActive_;
  }


  /**
   * Set the googleMapsIsActive value and spread the change to the heralds
   * @param {boolean} active value to update the google maps active flag with
   * @private
   */
  setGoogleMapsActive_(active) {
    this.googleMapsIsActive_ = active;
    this.imageWMSSourceHerald_.setGoogleMapsActive(active);
    this.tileSourceHerald_.setGoogleMapsActive(active);
    this.vectorSourceHerald_.setGoogleMapsActive(active);
  }


  /**
   * Set the watch options
   * @param {module:olgm/herald/Herald~WatchOptions} watchOptions whether each layer type
   * should be watched
   * @api
   */
  setWatchOptions(watchOptions) {
    this.watchOptions_ = watchOptions;

    // Re-watch the appropriate layers
    this.deactivate();
    this.activate();
  }


  /**
   * Callback method fired when a new layer is added to the map.
   * @param {module:ol/Collection~CollectionEvent} event Collection event.
   * @private
   */
  handleLayersAdd_(event) {
    const layer = /** @type {module:ol/layer/Base} */ (event.element);
    this.watchLayer_(layer);
    this.orderLayers();
  }


  /**
   * Callback method fired when a layer is removed from the map.
   * @param {module:ol/Collection~CollectionEvent} event Collection event.
   * @private
   */
  handleLayersRemove_(event) {
    const layer = /** @type {module:ol/layer/Base} */ (event.element);
    this.unwatchLayer_(layer);
    this.orderLayers();
  }


  /**
   * Watch the layer
   * @param {module:ol/layer/Base} layer layer to watch
   * @private
   */
  watchLayer_(layer) {
    if (layer instanceof GoogleLayer) {
      this.watchGoogleLayer_(layer);
    } else if (layer instanceof VectorLayer &&
          this.watchOptions_.vector !== false) {
      this.vectorSourceHerald_.watchLayer(layer);
    } else if (layer instanceof TileLayer &&
          this.watchOptions_.tile !== false) {
      this.tileSourceHerald_.watchLayer(layer);
    } else if (layer instanceof ImageLayer &&
          this.watchOptions_.image !== false) {
      this.imageWMSSourceHerald_.watchLayer(layer);
    }
  }


  /**
   * Watch the google layer
   * @param {module:olgm/layer/Google} layer google layer to watch
   * @private
   */
  watchGoogleLayer_(layer) {
    this.googleLayers_.push(layer);
    this.googleCache_.push(/** @type {module:olgm/herald/Layers~GoogleLayerCache} */ ({
      layer: layer,
      listener: new PropertyListener(layer, null, 'visible', () => this.toggleGoogleMaps_())
    }));
  }


  /**
   * Unwatch the layer
   * @param {module:ol/layer/Base} layer layer to unwatch
   * @private
   */
  unwatchLayer_(layer) {
    if (layer instanceof GoogleLayer) {
      this.unwatchGoogleLayer_(layer);
    } else if (layer instanceof VectorLayer) {
      this.vectorSourceHerald_.unwatchLayer(layer);
    } else if (layer instanceof TileLayer) {
      this.tileSourceHerald_.unwatchLayer(layer);
    } else if (layer instanceof ImageLayer) {
      this.imageWMSSourceHerald_.unwatchLayer(layer);
    }
  }


  /**
   * Unwatch the google layer
   * @param {module:olgm/layer/Google} layer google layer to unwatch
   * @private
   */
  unwatchGoogleLayer_(layer) {
    const index = this.googleLayers_.indexOf(layer);
    if (index !== -1) {
      this.googleLayers_.splice(index, 1);

      const cacheItem = this.googleCache_[index];
      cacheItem.listener.unlisten();

      this.googleCache_.splice(index, 1);

      this.toggleGoogleMaps_();
    }
  }


  /**
   * Activates the GoogleMaps map, i.e. put it in the ol3 map target and put
   * the ol3 map inside the gmap controls.
   * @private
   */
  activateGoogleMaps_() {

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
    this.viewHerald_.setRotation();
    this.viewHerald_.setZoomAndCenter();

    this.setGoogleMapsActive_(true);

    // activate all cache items
    this.imageWMSSourceHerald_.activate();
    this.tileSourceHerald_.activate();
    this.vectorSourceHerald_.activate();

    this.orderLayers();
  }


  /**
   * Deactivates the GoogleMaps map, i.e. put the ol3 map back in its target
   * and remove the gmap map.
   * @private
   */
  deactivateGoogleMaps_() {

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
  }


  /**
   * This method takes care of activating or deactivating the GoogleMaps map.
   * It is activated if at least one visible Google layer is currently in the
   * ol3 map (and vice-versa for deactivation). The top-most layer is used
   * to determine that. It is also used to change the GoogleMaps mapTypeId
   * accordingly too to fit the top-most ol3 Google layer.
   * @private
   */
  toggleGoogleMaps_() {

    let found = null;

    // find top-most Google layer
    this.ol3map.getLayers().getArray().slice(0).reverse().every(
      function(layer) {
        if (layer instanceof GoogleLayer &&
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
      // activate before changing mapTypeId/styles
      this.activateGoogleMaps_();

      // set mapTypeId
      this.gmap.setMapTypeId(found.getMapTypeId());
      // set styles
      const styles = found.getStyles();
      if (styles) {
        this.gmap.setOptions({'styles': styles});
      } else {
        this.gmap.setOptions({'styles': null});
      }
    } else {
      // deactivate
      this.deactivateGoogleMaps_();
    }
  }


  /**
   * Order the layers for each herald that supports it
   * @api
   */
  orderLayers() {
    this.imageWMSSourceHerald_.orderLayers();
    this.tileSourceHerald_.orderLayers();
  }


  /**
   * For each layer type that support refreshing, tell them to refresh
   * @api
   */
  refresh() {
    this.imageWMSSourceHerald_.refresh();
  }
}


export default LayersHerald;
