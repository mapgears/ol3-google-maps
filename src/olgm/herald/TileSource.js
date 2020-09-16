/**
 * @module olgm/herald/TileSource
 */
import {getIntersection, getSize} from 'ol/extent.js';
import {get} from 'ol/proj.js';
import TileImage from 'ol/source/TileImage.js';
import PanesOverlay from '../gm/PanesOverlay.js';
import SourceHerald from './Source.js';
import Listener from '../listener/Listener.js';
import PropertyListener from '../listener/PropertyListener.js';

/**
 * @typedef {Object} LayerCache
 * @property {Node|null} element
 * @property {google.maps.ImageMapType} googleTileLayer
 * @property {boolean} ignoreNextOpacityChange
 * @property {module:ol/layer/Tile} layer
 * @property {Array<module:olgm/AbstractListener~AbstractListener>} listeners
 * @property {number} opacity
 * @property {number} zIndex
 */

class TileSourceHerald extends SourceHerald {
  /**
   * Listen to a tiled layer
   * @param {module:ol/PluggableMap} ol3map openlayers map
   * @param {google.maps.Map} gmap google maps map
   */
  constructor(ol3map, gmap) {
    super(ol3map, gmap);

    /**
     * @type {Array<module:olgm/herald/TileSource~LayerCache>}
     * @private
     */
    this.cache_ = [];

    /**
     * @type {Array<module:ol/layer/Tile>}
     * @private
     */
    this.layers_ = [];

    /**
     * Panes accessor
     * @type {module:olgm/gm/PanesOverlay}
     * @private
     */
    this.panesOverlay_ = new PanesOverlay(gmap);

    /**
     * We can only access the mapPane pane after google maps is done loading.
     * Accessing that pane means we can reorder the div for each tile layer
     * Google Maps is rendering.
     */
    google.maps.event.addListenerOnce(gmap, 'idle', () => {
      this.orderLayers();
    });
  }

  /**
   * @param {module:ol/layer/Base} layer layer to watch
   * @override
   */
  watchLayer(layer) {
    const tileLayer = /** @type {module:ol/layer/Tile} */ (layer);

    // Source must be TileImage
    const source = tileLayer.getSource();
    if (!(source instanceof TileImage)) {
      return;
    }

    // If olgmWatch property is false then render using OL instead
    if (tileLayer.get('olgmWatch') === false) {
      return;
    }

    this.layers_.push(tileLayer);

    // opacity
    const opacity = tileLayer.getOpacity();

    const cacheItem = /** {@type module:olgm/herald/TileSource~LayerCache} */ ({
      element: null,
      ignoreNextOpacityChange: true,
      layer: tileLayer,
      listeners: [],
      opacity: opacity,
      zIndex: 0
    });

    const tileGrid = source.getTileGrid();
    let tileSize = 256;

    if (tileGrid) {
      const tileGridTileSize = tileGrid.getTileSize(0);
      if (typeof tileGridTileSize === 'number') {
        tileSize = tileGridTileSize;
      }
    }

    const googleTileSize = new google.maps.Size(tileSize, tileSize);

    const options = {
      getTileUrl: this.googleGetTileUrlFunction_.bind(this, tileLayer),
      tileSize: googleTileSize,
      isPng: true,
      opacity: opacity
    };

    // Create the tiled layer on the google layer
    const googleTileLayer = new google.maps.ImageMapType(options);
    if (tileLayer.getVisible()) {
      this.gmap.overlayMapTypes.push(googleTileLayer);
    }
    cacheItem.googleTileLayer = googleTileLayer;

    cacheItem.listeners.push(
      // Hide the google layer when the ol3 layer is invisible
      new Listener(
        tileLayer.on('change:visible', () =>
          this.handleVisibleChange_(cacheItem)
        )
      ),
      new Listener(
        tileLayer.on('change:opacity', () =>
          this.handleOpacityChange_(cacheItem)
        )
      ),
      new PropertyListener(tileLayer, null, 'source', (source, oldSource) => {
        if (oldSource) {
          this.handleSourceChange_(cacheItem);
        }
        return new Listener(
          source.on('change', () => this.handleSourceChange_(cacheItem))
        );
      })
    );

    // Activate the cache item
    this.activateCacheItem_(cacheItem);
    this.cache_.push(cacheItem);
  }

  /**
   * This function is used by google maps to get the url for a tile at the given
   * coordinates and zoom level
   * @param {module:ol/layer/Tile} tileLayer layer to query
   * @param {google.maps.Point} coords coordinates of the tile
   * @param {number} zoom current zoom level
   * @return {string|undefined} url to the tile
   * @private
   */
  googleGetTileUrlFunction_(tileLayer, coords, zoom) {
    const source = /** @type {ol.source.TileImage} */ (tileLayer.getSource());

    // Check if we're within the accepted resolutions
    const minResolution = tileLayer.getMinResolution();
    const maxResolution = tileLayer.getMaxResolution();
    const currentResolution = this.ol3map.getView().getResolution();
    if (
      currentResolution < minResolution ||
      currentResolution > maxResolution
    ) {
      return;
    }

    const proj = get('EPSG:3857');

    // Convert the coords from google maps to ol3 tile format
    const ol3Coords = [zoom, coords.x, coords.y];

    // Save the extent for this layer, default to the one for the projection
    let extent = tileLayer.getExtent();
    if (!extent) {
      extent = proj.getExtent();
    }

    /* Perform some verifications only possible with a TileGrid:
     * 1. If the origin for the layer isn't in the upper left corner, we need
     *    to move the tiles there. Google Maps doesn't support custom origins.
     * 2. Google Maps checks for tiles which might not exist, for example tiles
     *    above the world map. We need to filter out these to avoid invalid
     *    requests.
     */
    const tileGrid = source.getTileGrid();
    if (tileGrid) {
      /* Google maps always draws the tiles from the top left corner. We need to
       * adjust for that if our origin isn't at that location
       * The default origin is at the top left corner, and the default tile size
       * is 256.
       */
      const defaultOrigin = [-20037508.342789244, 20037508.342789244];
      const defaultTileSize = 256;
      const origin = tileGrid.getOrigin(0);

      // Skip this step if the origin is at the top left corner
      if (origin[0] != defaultOrigin[0] || origin[1] != defaultOrigin[1]) {
        /* Tiles have a size equal to 2^n. Find the difference between the n for
         * the current tileGrid versus the n for the expected tileGrid.
         */
        const tileGridTileSize = /** @type {number} */ (tileGrid.getTileSize(
          zoom
        ));

        const defaultTileSizeExponent = Math.log2(defaultTileSize);
        const tileSizeExponent = Math.log2(tileGridTileSize);
        const exponentDifference = tileSizeExponent - defaultTileSizeExponent;

        /* Calculate the offset to add to the tile coordinates, assuming the
         * origin to fix is equal to [0, 0]. TODO: Support different origins
         */
        const nbTilesSide = Math.pow(2, zoom - exponentDifference);
        const offset = nbTilesSide / 2;

        // Add the offset. Move the tiles left (x--) and up (y++)
        ol3Coords[1] = ol3Coords[1] - offset;
        ol3Coords[2] = ol3Coords[2] + offset;
      }

      /* Get the intersection area between the wanted tile's extent and the
       * layer's extent. If that intersection has an area smaller than 1, it
       * means it's not part of the map. We do this because a tile directly
       * above the map but not inside it still counts as an intersection, but
       * with a size of 0.
       */
      const intersection = getIntersection(
        extent,
        tileGrid.getTileCoordExtent(ol3Coords)
      );
      const intersectionSize = getSize(intersection);
      const intersectionArea = intersectionSize[0] * intersectionSize[1];

      if (intersectionArea < 1 || intersectionArea == Infinity) {
        return;
      }
    }

    let result = source.tileUrlFunction(ol3Coords, 1, proj);

    // TileJSON sources don't have their url function right away, try again
    if (result === undefined) {
      const getTileUrlFunction = source.getTileUrlFunction();
      result = getTileUrlFunction(ol3Coords, 1, proj);
    }

    return result;
  }

  /**
   * Unwatch the tile layer
   * @param {module:ol/layer/Base} layer layer to unwatch
   * @override
   */
  unwatchLayer(layer) {
    const tileLayer = /** @type {module:ol/layer/Tile} */ (layer);

    const index = this.layers_.indexOf(tileLayer);
    if (index !== -1) {
      this.layers_.splice(index, 1);

      const cacheItem = this.cache_[index];
      cacheItem.listeners.forEach((listener) => listener.unlisten());

      // Remove the layer from google maps
      const googleTileLayer = cacheItem.googleTileLayer;
      const googleMapsLayers = this.gmap.overlayMapTypes;

      // Get the position of the google layer so we can remove it
      const layerIndex = googleMapsLayers.getArray().indexOf(googleTileLayer);
      if (layerIndex != -1) {
        googleMapsLayers.removeAt(layerIndex);
      }

      // opacity
      tileLayer.setOpacity(cacheItem.opacity);

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
   * Activates an tile layer cache item.
   * @param {module:olgm/herald/TileSource~LayerCache} cacheItem cacheItem to activate
   * @private
   */
  activateCacheItem_(cacheItem) {
    const layer = cacheItem.layer;
    const visible = layer.getVisible();
    if (visible && this.googleMapsIsActive) {
      cacheItem.ignoreNextOpacityChange = true;
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
   * Deactivates a Tile layer cache item.
   * @param {module:olgm/herald/TileSource~LayerCache} cacheItem cacheItem to deactivate
   * @private
   */
  deactivateCacheItem_(cacheItem) {
    cacheItem.ignoreNextOpacityChange = true;
    cacheItem.layer.setOpacity(cacheItem.opacity);
  }

  /**
   * This function finds the div associated to each tile layer we watch, then
   * it assigns them the correct z-index
   * @api
   */
  orderLayers() {
    const panes = this.panesOverlay_.getMapPanes();

    if (!panes) {
      return;
    }
    const mapPane = panes.mapPane;
    const overlayMapTypes = this.gmap.overlayMapTypes;

    // For each tile layer we watch
    for (let i = 0; i < this.cache_.length; i++) {
      // Calculate the wanted index
      const cacheItem = this.cache_[i];
      const layer = cacheItem.layer;
      cacheItem.zIndex = this.findIndex(layer);

      // Get the google overlay layer, and its index
      const googleTileLayer = cacheItem.googleTileLayer;
      const overlayIndex = overlayMapTypes.getArray().indexOf(googleTileLayer);

      // If the layer is currently rendered by Google Maps
      if (overlayIndex != -1) {
        /**
         * We remove it, look at the divs in the mapPane, then add it back and
         * compare. This allows us to find which div is associated to that layer.
         */
        overlayMapTypes.removeAt(overlayIndex);
        const childNodes = Array.prototype.slice.call(mapPane.childNodes);
        overlayMapTypes.push(googleTileLayer);
        const childNodesWithLayer = mapPane.childNodes;

        /**
         * Find which layer is missing from the list we created after removing
         * the appropriate overlay
         */
        for (let j = 0; j < childNodesWithLayer.length; j++) {
          if (childNodes.indexOf(childNodesWithLayer[j]) == -1) {
            // Set a timeout because otherwise it won't work
            cacheItem.element = childNodesWithLayer[j];
            setTimeout(function() {
              this.element.style.zIndex = this.zIndex;
            }.bind(cacheItem), 0);
          }
        }
      }
    }
  }

  /**
   * Handle the opacity being changed on the tile layer
   * @param {module:olgm/herald/TileSource~LayerCache} cacheItem cacheItem for the
   * watched layer
   * @private
   */
  handleOpacityChange_(cacheItem) {
    const layer = cacheItem.layer;
    const newOpacity = cacheItem.layer.getOpacity();

    /**
     * Each time the opacity is set on the ol3 layer, we need to set it back to
     * opacity 0, and apply the opacity to the layer rendered by Google Maps
     * instead. However, setting the opacity back to 0 generates another opacity
     * change event, so we need to ignore it
     */
    if (cacheItem.ignoreNextOpacityChange) {
      cacheItem.ignoreNextOpacityChange = false;
    } else {
      cacheItem.googleTileLayer.setOpacity(newOpacity);
      cacheItem.opacity = newOpacity;

      const visible = layer.getVisible();
      if (visible && this.googleMapsIsActive) {
        cacheItem.ignoreNextOpacityChange = true;
        cacheItem.layer.setOpacity(0);
      }
    }
  }

  /**
   * Deal with the google tile layer when we enable or disable the OL3 tile layer
   * @param {module:olgm/herald/TileSource~LayerCache} cacheItem cacheItem for the
   * watched layer
   * @private
   */
  handleVisibleChange_(cacheItem) {
    const layer = cacheItem.layer;
    const visible = layer.getVisible();

    const googleTileLayer = cacheItem.googleTileLayer;
    const googleMapsLayers = this.gmap.overlayMapTypes;

    // Get the position of the google layer so we can remove it
    const layerIndex = googleMapsLayers.getArray().indexOf(googleTileLayer);

    if (visible) {
      // Add the google tile layer only if it's not there already
      if (layerIndex == -1) {
        googleMapsLayers.push(googleTileLayer);
      }
      this.activateCacheItem_(cacheItem);
    } else {
      // Remove the google tile layer from the map if it hasn't been done already
      if (layerIndex != -1) {
        googleMapsLayers.removeAt(layerIndex);
      }
      this.deactivateCacheItem_(cacheItem);
    }
  }

  /**
   * Called the source of layer fires the 'change' event. Reload the google tile
   * layer.
   *
   * @param {module:olgm/herald/TileSource~LayerCache} cacheItem cacheItem for the
   * watched layer
   * @private
   */
  handleSourceChange_(cacheItem) {
    // Note: The 'changed' method of google.maps.MVCObject requires a param,
    //       but it's not acutally used here.  It's just to satisfy the compiler.
    cacheItem.googleTileLayer.changed('foo');
  }
}


export default TileSourceHerald;
