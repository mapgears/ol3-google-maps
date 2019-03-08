/**
 * @module olgm/herald/VectorSource
 */
import {createStyle} from '../gm.js';
import SourceHerald from './Source.js';
import VectorFeatureHerald from './VectorFeature.js';
import PropertyListener from '../listener/PropertyListener.js';

/**
 * @typedef {Object} LayerCache
 * @property {google.maps.Data} data
 * @property {module:olgm/herald/VectorFeature} herald
 * @property {module:ol/layer/Vector} layer
 * @property {?module:olgm/AbstractListener~AbstractListener} listeners
 * @property {number} opacity
 */

class VectorSourceHerald extends SourceHerald {
  /**
   * Listen to a Vector layer
   * @param {module:ol/PluggableMap} ol3map openlayers map
   * @param {google.maps.Map} gmap google maps map
   * @param {module:olgm/gm/MapIcon~Options} mapIconOptions map icon options
   */
  constructor(ol3map, gmap, mapIconOptions) {
    super(ol3map, gmap);

    /**
    * @type {Array<module:olgm/herald/VectorSource~LayerCache>}
    * @private
    */
    this.cache_ = [];

    /**
    * @type {Array<module:ol/layer/Vector>}
    * @private
    */
    this.layers_ = [];

    /**
     * @type {module:olgm/gm/MapIcon~Options}
     * @private
     */
    this.mapIconOptions_ = mapIconOptions;
  }


  /**
   * @param {module:ol/layer/Base} layer layer to watch
   * @override
   */
  watchLayer(layer) {
    const vectorLayer = /** @type {module:ol/layer/Vector} */ (layer);

    // Source required
    const source = vectorLayer.getSource();
    if (!source) {
      return;
    }

    // If olgmWatch property is false then render using OL instead
    if (vectorLayer.get('olgmWatch') === false) {
      return;
    }

    this.layers_.push(vectorLayer);

    // Data
    const data = new google.maps.Data({
      'map': this.gmap
    });

    // Style
    const gmStyle = createStyle(vectorLayer, this.mapIconOptions_);
    if (gmStyle) {
      data.setStyle(gmStyle);
    }

    // herald
    const herald = new VectorFeatureHerald(
      this.ol3map, this.gmap, source, data, this.mapIconOptions_);

    // opacity
    const opacity = vectorLayer.getOpacity();

    const cacheItem = /** {@type module:olgm/herald/VectorSource~LayerCache} */ ({
      data: data,
      herald: herald,
      layer: vectorLayer,
      listeners: [],
      opacity: opacity
    });

    cacheItem.listeners.push(
      new PropertyListener(this.ol3map, null, 'view', (view, oldView) => {
        return [
          new PropertyListener(view, oldView, 'resolution', () => this.handleResolutionChange_(cacheItem)),
          new PropertyListener(view, oldView, 'visible', () => this.handleVisibleChange_(cacheItem))
        ];
      })
    );

    this.activateCacheItem_(cacheItem);

    this.cache_.push(cacheItem);
  }


  /**
   * Unwatch the vector layer
   * @param {module:ol/layer/Base} layer layer to unwatch
   * @override
   */
  unwatchLayer(layer) {
    const vectorLayer = /** @type {module:ol/layer/Vector} */ (layer);

    const index = this.layers_.indexOf(vectorLayer);
    if (index !== -1) {
      this.layers_.splice(index, 1);

      const cacheItem = this.cache_[index];
      cacheItem.listeners.forEach(listener => listener.unlisten());

      // data - unset
      cacheItem.data.setMap(null);

      // herald
      cacheItem.herald.deactivate();

      // opacity
      vectorLayer.setOpacity(cacheItem.opacity);

      this.cache_.splice(index, 1);
    }

  }


  /**
   * Activate all cache items
   * @api
   * @override
   */
  activate() {
    super.activate();
    this.cache_.forEach(this.activateCacheItem_, this);
  }


  /**
   * Activates an image WMS layer cache item.
   * @param {module:olgm/herald/VectorSource~LayerCache} cacheItem cacheItem to activate
   * @private
   */
  activateCacheItem_(cacheItem) {
    const layer = cacheItem.layer;
    const visible = layer.getVisible();
    if (visible && this.googleMapsIsActive) {
      cacheItem.herald.activate();
      cacheItem.layer.setOpacity(0);
    }
  }


  /**
   * Deactivate all cache items
   * @api
   * @override
   */
  deactivate() {
    super.deactivate();
    this.cache_.forEach(this.deactivateCacheItem_, this);
  }


  /**
   * Deactivates a Tile WMS layer cache item.
   * @param {module:olgm/herald/VectorSource~LayerCache} cacheItem cacheItem to
   * deactivate
   * @private
   */
  deactivateCacheItem_(cacheItem) {
    cacheItem.herald.deactivate();
    cacheItem.layer.setOpacity(cacheItem.opacity);
  }


  handleResolutionChange_(cacheItem) {
    const layer = cacheItem.layer;

    const minResolution = layer.getMinResolution();
    const maxResolution = layer.getMaxResolution();
    const currentResolution = this.ol3map.getView().getResolution();
    if (currentResolution < minResolution || currentResolution > maxResolution) {
      cacheItem.herald.setVisible(false);
    } else {
      cacheItem.herald.setVisible(true);
    }
  }


  /**
   * Deal with the google WMS layer when we enable or disable the OL3 WMS layer
   * @param {module:olgm/herald/VectorSource~LayerCache} cacheItem cacheItem for the
   * watched layer
   * @private
   */
  handleVisibleChange_(cacheItem) {
    const layer = cacheItem.layer;
    const visible = layer.getVisible();
    if (visible) {
      this.activateCacheItem_(cacheItem);
    } else {
      this.deactivateCacheItem_(cacheItem);
    }
  }
}


export default VectorSourceHerald;
