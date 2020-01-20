/**
 * @module olgm/herald/ImageWMSSource
 */
import {getTopLeft} from 'ol/extent.js';
import {transform} from 'ol/proj.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import {assert} from '../asserts.js';
import ImageOverlay from '../gm/ImageOverlay.js';
import SorceHerald from './Source.js';
import {assign} from '../obj.js';
import {appendParams} from '../uri.js';
import PropertyListener from '../listener/PropertyListener.js';
import Listener from '../listener/Listener.js';

/**
 * @typedef {Object} LayerCache
 * @property {module:olgm/gm/ImageOverlay} imageOverlay
 * @property {string|null} lastUrl
 * @property {module:ol/layer/Image} layer
 * @property {Array<module:olgm/AbstractListener~AbstractListener>} listeners
 * @property {number} opacity
 * @property {number} zIndex
 */

class ImageWMSSourceHerald extends SorceHerald {
  /**
   * Listen to a Image WMS layer
   * @param {module:ol/PluggableMap} ol3map openlayers map
   * @param {google.maps.Map} gmap google maps map
   */
  constructor(ol3map, gmap) {
    super(ol3map, gmap);

    /**
    * @type {Array<module:olgm/herald/ImageWMSSource~LayerCache>}
    * @private
    */
    this.cache_ = [];

    /**
    * @type {Array<module:ol/layer/Image>}
    * @private
    */
    this.layers_ = [];
  }


  /**
   * @param {module:ol/layer/Base} layer layer to watch
   * @override
   */
  watchLayer(layer) {
    const imageLayer = /** @type {module:ol/layer/Image} */ (layer);

    // Source must be ImageWMS
    const source = imageLayer.getSource();
    if (!(source instanceof ImageWMS)) {
      return;
    }

    // If olgmWatch property is false then render using OL instead
    if (imageLayer.get('olgmWatch') === false) {
      return;
    }

    this.layers_.push(imageLayer);

    // opacity
    const opacity = imageLayer.getOpacity();

    const cacheItem = /** {@type module:olgm/herald/ImageWMSSource~LayerCache} */ ({
      imageOverlay: null,
      lastUrl: null,
      layer: imageLayer,
      listeners: [],
      opacity: opacity,
      zIndex: 0
    });
    cacheItem.listeners.push(
      // Hide the google layer when the ol3 layer is invisible
      new Listener(imageLayer.on('change:visible', () => this.handleVisibleChange_(cacheItem))),
      new Listener(this.ol3map.on('moveend', () => this.handleMoveEnd_(cacheItem))),
      new PropertyListener(this.ol3map, null, 'view', (view, oldView) => {
        return new PropertyListener(view, oldView, 'resolution', () => this.handleMoveEnd_(cacheItem));
      }),
      // Make sure that any change to the layer source itself also updates the
      // google maps layer
      new PropertyListener(imageLayer, null, 'source', source => {
        if (source) {
          this.handleMoveEnd_(cacheItem);
        }
        return new Listener(source.on('change', () => this.handleMoveEnd_(cacheItem)));
      })
    );

    // Activate the cache item
    this.activateCacheItem_(cacheItem);
    this.cache_.push(cacheItem);
  }


  /**
   * Unwatch the WMS Image layer
   * @param {module:ol/layer/Base} layer layer to unwatch
   * @override
   */
  unwatchLayer(layer) {
    const imageLayer = /** @type {module:ol/layer/Image} */ (layer);

    const index = this.layers_.indexOf(imageLayer);
    if (index !== -1) {
      this.layers_.splice(index, 1);

      const cacheItem = this.cache_[index];
      if (cacheItem.listeners) {
        cacheItem.listeners.forEach(listener => listener.unlisten());
      }

      // Clean previous overlay
      this.resetImageOverlay_(cacheItem);

      // opacity
      imageLayer.setOpacity(cacheItem.opacity);

      this.cache_.splice(index, 1);
    }
  }


  /**
   * Activate all cache items
   * @override
   */
  activate() {
    super.activate();
    this.cache_.forEach(this.activateCacheItem_, this);
  }


  /**
   * Activates an image WMS layer cache item.
   * @param {module:olgm/herald/ImageWMSSource~LayerCache} cacheItem cacheItem to
   * activate
   * @private
   */
  activateCacheItem_(cacheItem) {
    const layer = cacheItem.layer;
    const visible = layer.getVisible();
    if (visible && this.googleMapsIsActive) {
      cacheItem.lastUrl = null;
      cacheItem.layer.setOpacity(0);
      this.updateImageOverlay_(cacheItem);
    }
  }


  /**
   * Deactivate all cache items
   * @override
   */
  deactivate() {
    super.deactivate();
    this.cache_.forEach(this.deactivateCacheItem_, this);
  }


  /**
   * Deactivates an Image WMS layer cache item.
   * @param {module:olgm/herald/ImageWMSSource~LayerCache} cacheItem cacheItem to
   * deactivate
   * @private
   */
  deactivateCacheItem_(cacheItem) {
    if (cacheItem.imageOverlay) {
      cacheItem.imageOverlay.setMap(null);
      cacheItem.imageOverlay = null;
    }
    cacheItem.layer.setOpacity(cacheItem.opacity);
  }


  /**
   * Generate a wms request url for a single image
   * @param {module:ol/layer/Image} layer layer to query
   * @return {string} url to the requested tile
   * @private
   */
  generateImageWMSFunction_(layer) {
    let key;
    const source = /** @type {ol.source.ImageWMS} */ (layer.getSource());

    const params = source.getParams();
    const ol3map = this.ol3map;

    //base WMS URL
    const baseUrl = /** @type {string} */ (source.getUrl());
    assert(
      baseUrl !== undefined, 'Expected the source to have an url');
    const size = ol3map.getSize();

    assert(
      size !== undefined, 'Expected the map to have a size');

    const view = ol3map.getView();
    const bbox = view.calculateExtent(size);

    // Separate original WMS params and custom ones
    const wmsParamsList = [
      'CRS',
      'BBOX',
      'FORMAT',
      'HEIGHT',
      'LAYERS',
      'REQUEST',
      'SERVICE',
      'SRS',
      'STYLES',
      'TILED',
      'TRANSPARENT',
      'VERSION',
      'WIDTH'
    ];
    const customParams = {};
    const wmsParams = {};
    for (key in params) {
      const upperCaseKey = key.toUpperCase();
      if (wmsParamsList.indexOf(upperCaseKey) === -1) {
        if (params[key] !== undefined && params[key] !== null) {
          customParams[key] = params[key];
        }
      } else {
        wmsParams[upperCaseKey] = params[key];
      }
    }

    // Set WMS params
    const version = wmsParams['VERSION'] ? wmsParams['VERSION'] : '1.3.0';
    const layers = wmsParams['LAYERS'] ? wmsParams['LAYERS'] : '';
    const styles = wmsParams['STYLES'] ? wmsParams['STYLES'] : '';
    const format = wmsParams['FORMAT'] ? wmsParams['FORMAT'] : 'image/png';
    const transparent = wmsParams['TRANSPARENT'] ?
      wmsParams['TRANSPARENT'] : 'TRUE';
    const tiled = wmsParams['TILED'] ? wmsParams['TILED'] : 'FALSE';

    // Check whether or not we're using WMS 1.3.0
    const versionNumbers = version.split('.');
    const wms13 = (
      parseInt(versionNumbers[0], 10) >= 1 &&
      parseInt(versionNumbers[1], 10) >= 3);

    const queryParams = {
      'BBOX': bbox,
      'FORMAT': format,
      'HEIGHT': size[1],
      'LAYERS': layers,
      'REQUEST': 'GetMap',
      'SERVICE': 'WMS',
      'STYLES': styles,
      'TILED': tiled,
      'TRANSPARENT': transparent,
      'VERSION': version,
      'WIDTH': size[0]
    };

    const epsg3857 = 'EPSG:3857';
    if (wms13) {
      queryParams['CRS'] = epsg3857;
    } else {
      queryParams['SRS'] = epsg3857;
    }

    assign(queryParams, customParams);

    const url = appendParams(baseUrl, queryParams);

    return url;
  }


  /**
   * Clean-up the image overlay
   * @param {module:olgm/herald/ImageWMSSource~LayerCache} cacheItem cacheItem
   * @private
   */
  resetImageOverlay_(cacheItem) {
    // Clean previous overlay
    if (cacheItem.imageOverlay) {
      // Remove the overlay from the map
      cacheItem.imageOverlay.setMap(null);

      // Destroy the overlay
      cacheItem.imageOverlay = null;
    }
  }


  /**
   * Refresh the custom image overlay on google maps
   * @param {module:olgm/herald/ImageWMSSource~LayerCache} cacheItem cacheItem for the
   * layer to update
   * @param {boolean=} opt_force whether we should refresh even if the
   * url for the request hasn't changed. Defaults to false.
   * @private
   */
  updateImageOverlay_(cacheItem, opt_force) {
    const layer = cacheItem.layer;

    if (!layer.getVisible()) {
      return;
    }

    let url = this.generateImageWMSFunction_(layer);
    const forceRefresh = opt_force == true;

    // Force a refresh by setting a new url
    if (forceRefresh) {
      url += '&timestamp=' + new Date().getTime();
    }

    // Check if we're within the accepted resolutions
    const minResolution = layer.getMinResolution();
    const maxResolution = layer.getMaxResolution();
    const currentResolution = this.ol3map.getView().getResolution();
    if (currentResolution < minResolution || currentResolution > maxResolution) {
      this.resetImageOverlay_(cacheItem);
      return;
    }

    /* We listen to both change:resolution and moveend events. However, changing
    * resolution eventually sends a moveend event as well. Using only the
    * moveend event makes zooming in/out look bad. To prevent rendering the
    * overlay twice when it happens, we save the request url, and if it's the
    * same as the last time, we don't render it.
    */
    if (url == cacheItem.lastUrl) {
      return;
    }

    cacheItem.lastUrl = url;

    // Create a new overlay
    const view = this.ol3map.getView();
    const size = this.ol3map.getSize();

    assert(
      size !== undefined, 'Expected the map to have a size');

    const extent = view.calculateExtent(size);

    // First, get the coordinates of the top left corner
    const topLeft = getTopLeft(extent);

    // Then, convert it to LatLng coordinates for google
    const lngLat = transform(topLeft, 'EPSG:3857', 'EPSG:4326');
    const topLeftLatLng = new google.maps.LatLng(lngLat[1], lngLat[0]);

    const overlay = new ImageOverlay(
      url,
      /** @type {Array<number>} */ (size),
      topLeftLatLng);
    overlay.setZIndex(cacheItem.zIndex);

    // Set the new overlay right away to give it time to render
    overlay.setMap(this.gmap);

    // Clean previous overlay
    this.resetImageOverlay_(cacheItem);

    // Save new overlay
    cacheItem.imageOverlay = overlay;
  }


  /**
   * Order the layers by index in the ol3 layers array
   * @api
   */
  orderLayers() {
    for (let i = 0; i < this.cache_.length; i++) {
      const cacheItem = this.cache_[i];
      const layer = cacheItem.layer;
      const zIndex = this.findIndex(layer);
      cacheItem.zIndex = zIndex;

      // There won't be an imageOverlay while Google Maps isn't visible
      if (cacheItem.imageOverlay) {
        cacheItem.imageOverlay.setZIndex(zIndex);
      }
    }
  }


  /**
   * Refresh the image overlay for each cache item
   * @api
   */
  refresh() {
    for (let i = 0; i < this.cache_.length; i++) {
      this.updateImageOverlay_(this.cache_[i], true);
    }
  }


  /**
   * Deal with the google WMS layer when we enable or disable the OL3 WMS layer
   * @param {module:olgm/herald/ImageWMSSource~LayerCache} cacheItem cacheItem for the
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


  /**
   * Handle the map being panned when an ImageWMS layer is present
   * @param {module:olgm/herald/ImageWMSSource~LayerCache} cacheItem cacheItem for the
   * watched layer
   * @private
   */
  handleMoveEnd_(cacheItem) {
    if (cacheItem.layer.getVisible() && this.ol3map.getView().getCenter()) {
      this.updateImageOverlay_(cacheItem);
    }
  }
}


export default ImageWMSSourceHerald;
