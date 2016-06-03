goog.provide('olgm.herald.Layers');

goog.require('goog.asserts');
goog.require('olgm');
goog.require('olgm.gm');
goog.require('olgm.gm.ImageOverlay');
goog.require('olgm.herald.Herald');
goog.require('olgm.herald.VectorSource');
goog.require('olgm.herald.View');
goog.require('olgm.layer.Google');



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
 *     When a vector layers is added, a `olgm.herald.VectorSource` is created
 *     to manage its `ol.source.Vector`. The layer is immediately rendered
 *     fully transparent, making the interactions still possible over it
 *     while being invisible.
 *
 * @param {!ol.Map} ol3map
 * @param {!google.maps.Map} gmap
 * @param {boolean} watchVector
 * @constructor
 * @extends {olgm.herald.Herald}
 */
olgm.herald.Layers = function(ol3map, gmap, watchVector) {

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
   * @type {Array.<olgm.herald.Layers.VectorLayerCache>}
   * @private
   */
  this.vectorCache_ = [];

  /**
   * @type {Array.<ol.layer.Vector>}
   * @private
   */
  this.vectorLayers_ = [];

  /**
   * @type {Array.<olgm.herald.Layers.ImageWMSLayerCache>}
   * @private
   */
  this.imageWMSCache_ = [];

  /**
   * @type {Array.<ol.layer.Image>}
   * @private
   */
  this.imageWMSLayers_ = [];

  /**
   * @type {Array.<olgm.herald.Layers.TileWMSLayerCache>}
   * @private
   */
  this.tileWMSCache_ = [];

  /**
   * @type {Array.<ol.layer.Tile>}
   * @private
   */
  this.tileWMSLayers_ = [];

  /**
   * @type {olgm.herald.View}
   * @private
   */
  this.viewHerald_ = new olgm.herald.View(ol3map, gmap);

  /**
   * @type {boolean}
   * @private
   */
  this.watchVector_ = watchVector;


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


  goog.base(this, ol3map, gmap);


  // some controls, like the ol.control.ZoomSlider, require the map div
  // to have a size. While activating Google Maps, the size of the ol3 map
  // becomes moot. The code below fixes that.
  var center = this.ol3map.getView().getCenter();
  if (!center) {
    this.ol3map.getView().once('change:center', function() {
      this.ol3map.once('postrender', function() {
        this.ol3mapIsRenderered_ = true;
        this.toggleGoogleMaps_();
      }, this);
      this.toggleGoogleMaps_();
    }, this);
  } else {
    this.ol3map.once('postrender', function() {
      this.ol3mapIsRenderered_ = true;
      this.toggleGoogleMaps_();
    }, this);
  }
};
goog.inherits(olgm.herald.Layers, olgm.herald.Herald);


/**
 * Flag that determines whether the GoogleMaps map is currently active, i.e.
 * is currently shown and has the OpenLayers map added as one of its control.
 * @type {boolean}
 * @private
 */
olgm.herald.Layers.prototype.googleMapsIsActive_ = false;


/**
 * @type {boolean}
 * @private
 */
olgm.herald.Layers.prototype.ol3mapIsRenderered_ = false;


/**
 * @inheritDoc
 */
olgm.herald.Layers.prototype.activate = function() {
  goog.base(this, 'activate');

  var layers = this.ol3map.getLayers();

  // watch existing layers
  layers.forEach(this.watchLayer_, this);

  // event listeners
  var keys = this.listenerKeys;
  keys.push(layers.on('add', this.handleLayersAdd_, this));
  keys.push(layers.on('remove', this.handleLayersRemove_, this));
};


/**
 * @inheritDoc
 */
olgm.herald.Layers.prototype.deactivate = function() {
  // unwatch existing layers
  this.ol3map.getLayers().forEach(this.unwatchLayer_, this);

  goog.base(this, 'deactivate');
};


/**
 * @return {boolean}
 */
olgm.herald.Layers.prototype.getGoogleMapsActive = function() {
  return this.googleMapsIsActive_;
};


/**
 * Callback method fired when a new layer is added to the map.
 * @param {ol.CollectionEvent} event Collection event.
 * @private
 */
olgm.herald.Layers.prototype.handleLayersAdd_ = function(event) {
  var layer = event.element;
  goog.asserts.assertInstanceof(layer, ol.layer.Base);
  this.watchLayer_(layer);
};


/**
 * Callback method fired when a layer is removed from the map.
 * @param {ol.CollectionEvent} event Collection event.
 * @private
 */
olgm.herald.Layers.prototype.handleLayersRemove_ = function(event) {
  var layer = event.element;
  goog.asserts.assertInstanceof(layer, ol.layer.Base);
  this.unwatchLayer_(layer);
};


/**
 * Watch the layer
 * @param {ol.layer.Base} layer
 * @private
 */
olgm.herald.Layers.prototype.watchLayer_ = function(layer) {
  if (layer instanceof olgm.layer.Google) {
    this.watchGoogleLayer_(layer);
  } else if (layer instanceof ol.layer.Vector && this.watchVector_) {
    this.watchVectorLayer_(layer);
  } else if (layer instanceof ol.layer.Tile) {
    var source = layer.getSource();
    if (source instanceof ol.source.TileWMS) {
      this.watchTileWMSLayer_(layer);
    }
  } else if (layer instanceof ol.layer.Image) {
    var source = layer.getSource();
    if (source instanceof ol.source.ImageWMS) {
      this.watchImageWMSLayer_(layer);
    }
  }
};


/**
 * Watch the google layer
 * @param {olgm.layer.Google} layer
 * @private
 */
olgm.herald.Layers.prototype.watchGoogleLayer_ = function(layer) {
  this.googleLayers_.push(layer);
  this.googleCache_.push(/** @type {olgm.herald.Layers.GoogleLayerCache} */ ({
    layer: layer,
    listenerKeys: [
      layer.on('change:visible', this.toggleGoogleMaps_, this)
    ]
  }));
  this.toggleGoogleMaps_();
};


/**
 * Watch an image WMS layer, and create a layer on the google maps layer
 * @param {ol.layer.Image} layer
 * @private
 */
olgm.herald.Layers.prototype.watchImageWMSLayer_ = function(layer) {
  // Source required
  var source = layer.getSource();
  if (!source) {
    return;
  }

  this.imageWMSLayers_.push(layer);

  // opacity
  var opacity = layer.getOpacity();

  var cacheItem = /** {@type olgm.herald.Layers.ImageWMSLayerCache} */ ({
    imageOverlay: null,
    lastUrl: null,
    layer: layer,
    listenerKeys: [],
    opacity: opacity
  });

  // Hide the google layer when the ol3 layer is invisible
  cacheItem.listenerKeys.push(layer.on('change:visible',
      this.handleImageWMSLayerVisibleChange_.bind(this, cacheItem), this));

  cacheItem.listenerKeys.push(this.ol3map.on('moveend',
      this.handleImageWMSMoveEnd_.bind(this, cacheItem), this));

  cacheItem.listenerKeys.push(this.ol3map.getView().on('change:resolution',
      this.handleImageWMSMoveEnd_.bind(this, cacheItem), this));

  // Activate the cache item
  this.activateImageWMSLayerCacheItem_(cacheItem);
  this.imageWMSCache_.push(cacheItem);
};


/**
 * Generate a wms request url for a single image
 * @param {ol.layer.Image} layer
 * @return {string}
 * @private
 */
olgm.herald.Layers.prototype.generateImageWMSFunction_ = function(layer) {
  var source = layer.getSource();
  var params = source.getParams();
  var ol3map = this.ol3map;

  //base WMS URL
  var url = source.getUrl();
  var size = ol3map.getSize();

  goog.asserts.assert(size !== undefined);

  var view = ol3map.getView();
  var bbox = view.calculateExtent(size);

  // Get params
  var version = params['VERSION'] ? params['VERSION'] : '1.3.0';
  var layers = params['LAYERS'] ? params['LAYERS'] : '';
  var styles = params['STYLES'] ? params['STYLES'] : '';
  var format = params['FORMAT'] ? params['FORMAT'] : 'image/png';
  var transparent = params['TRANSPARENT'] ? params['TRANSPARENT'] : 'TRUE';
  var tiled = params['TILED'] ? params['TILED'] : 'FALSE';

  url += '?SERVICE=WMS';
  url += '&VERSION=' + version;
  url += '&REQUEST=GetMap';
  url += '&LAYERS=' + layers;
  url += '&STYLES=' + styles;
  url += '&FORMAT=' + format;
  url += '&TRANSPARENT=' + transparent;
  url += '&SRS=EPSG:3857';
  url += '&BBOX=' + bbox;
  url += '&WIDTH=' + size[0];
  url += '&HEIGHT=' + size[1];
  url += '&TILED=' + tiled;

  return url;
};


/**
 * Watch a tiled WMS layer, and create a layer on the google maps layer
 * @param {ol.layer.Tile} layer
 * @private
 */
olgm.herald.Layers.prototype.watchTileWMSLayer_ = function(layer) {
  // Source required
  var source = layer.getSource();
  if (!source) {
    return;
  }
  var params = source.getParams();

  this.tileWMSLayers_.push(layer);

  // opacity
  var opacity = layer.getOpacity();

  var cacheItem = /** {@type olgm.herald.Layers.TileWMSLayerCache} */ ({
    googleWMSLayer: null,
    layer: layer,
    listenerKeys: [],
    opacity: opacity
  });

  var getTileUrlFunction = source.getTileUrlFunction();
  var proj = ol.proj.get('EPSG:3857');

  var googleGetTileUrlFunction = function(coords, zoom) {
    var ol3Coords = [zoom, coords.x, (-coords.y) - 1];
    return getTileUrlFunction(ol3Coords, 1, proj, params);
  };

  var tileSize = new google.maps.Size(256, 256);

  var options = {
    'getTileUrl': googleGetTileUrlFunction,
    'tileSize': tileSize,
    'isPng': true
  };

  // Create the WMS layer on the google layer
  var googleWMSLayer = new google.maps.ImageMapType(options);
  if (layer.getVisible()) {
    this.gmap.overlayMapTypes.push(googleWMSLayer);
  }
  cacheItem.googleWMSLayer = googleWMSLayer;

  // Hide the google layer when the ol3 layer is invisible
  cacheItem.listenerKeys.push(layer.on('change:visible',
      this.handleTileWMSLayerVisibleChange_.bind(this, cacheItem), this));

  // Activate the cache item
  this.activateTileWMSLayerCacheItem_(cacheItem);
  this.tileWMSCache_.push(cacheItem);
};


/**
 * Watch the vector layer
 * @param {ol.layer.Vector} layer
 * @private
 */
olgm.herald.Layers.prototype.watchVectorLayer_ = function(layer) {

  var ol3map = this.ol3map;
  var gmap = this.gmap;

  // a source is required to work with this layer
  var source = layer.getSource();
  if (!source) {
    return;
  }

  this.vectorLayers_.push(layer);

  // Data
  var data = new google.maps.Data({
    'map': gmap
  });

  // Style
  var gmStyle = olgm.gm.createStyle(layer);
  if (gmStyle) {
    data.setStyle(gmStyle);
  }

  // herald
  var herald = new olgm.herald.VectorSource(ol3map, gmap, source, data);

  // opacity
  var opacity = layer.getOpacity();

  var cacheItem = /** {@type olgm.herald.Layers.VectorLayerCache} */ ({
    data: data,
    herald: herald,
    layer: layer,
    listenerKeys: [],
    opacity: opacity
  });

  cacheItem.listenerKeys.push(layer.on('change:visible',
      this.handleVectorLayerVisibleChange_.bind(this, cacheItem), this));

  this.activateVectorLayerCacheItem_(cacheItem);

  this.vectorCache_.push(cacheItem);
};


/**
 * Unwatch the layer
 * @param {ol.layer.Base} layer
 * @private
 */
olgm.herald.Layers.prototype.unwatchLayer_ = function(layer) {
  if (layer instanceof olgm.layer.Google) {
    this.unwatchGoogleLayer_(layer);
  } else if (layer instanceof ol.layer.Vector && this.watchVector_) {
    this.unwatchVectorLayer_(layer);
  } else if (layer instanceof ol.layer.Tile) {
    var source = layer.getSource();
    if (source instanceof ol.source.TileWMS) {
      this.unwatchTileWMSLayer_(layer);
    }
  } else if (layer instanceof ol.layer.Image) {
    var source = layer.getSource();
    if (source instanceof ol.source.ImageWMS) {
      this.unwatchImageWMSLayer_(layer);
    }
  }
};


/**
 * Unwatch the google layer
 * @param {olgm.layer.Google} layer
 * @private
 */
olgm.herald.Layers.prototype.unwatchGoogleLayer_ = function(layer) {
  var index = this.googleLayers_.indexOf(layer);
  if (index !== -1) {
    this.googleLayers_.splice(index, 1);

    var cacheItem = this.googleCache_[index];
    olgm.unlistenAllByKey(cacheItem.listenerKeys);

    this.googleCache_.splice(index, 1);

    this.toggleGoogleMaps_();
  }
};


/**
 * Unwatch the WMS Image layer
 * @param {ol.layer.Image} layer
 * @private
 */
olgm.herald.Layers.prototype.unwatchImageWMSLayer_ = function(layer) {
  var index = this.imageWMSLayers_.indexOf(layer);
  if (index !== -1) {
    this.imageWMSLayers_.splice(index, 1);

    var cacheItem = this.imageWMSCache_[index];
    olgm.unlistenAllByKey(cacheItem.listenerKeys);

    // opacity
    layer.setOpacity(cacheItem.opacity);

    this.imageWMSCache_.splice(index, 1);
  }
};


/**
 * Unwatch the WMS Tile layer
 * @param {ol.layer.Tile} layer
 * @private
 */
olgm.herald.Layers.prototype.unwatchTileWMSLayer_ = function(layer) {
  var index = this.tileWMSLayers_.indexOf(layer);
  if (index !== -1) {
    this.tileWMSLayers_.splice(index, 1);

    var cacheItem = this.tileWMSCache_[index];
    olgm.unlistenAllByKey(cacheItem.listenerKeys);

    // opacity
    layer.setOpacity(cacheItem.opacity);

    this.tileWMSCache_.splice(index, 1);
  }
};


/**
 * Unwatch the vector layer
 * @param {ol.layer.Vector} layer
 * @private
 */
olgm.herald.Layers.prototype.unwatchVectorLayer_ = function(layer) {
  var index = this.vectorLayers_.indexOf(layer);
  if (index !== -1) {
    this.vectorLayers_.splice(index, 1);

    var cacheItem = this.vectorCache_[index];
    olgm.unlistenAllByKey(cacheItem.listenerKeys);

    // data - unset
    cacheItem.data.setMap(null);

    // herald
    cacheItem.herald.deactivate();

    // opacity
    layer.setOpacity(cacheItem.opacity);

    this.vectorCache_.splice(index, 1);
  }
};


/**
 * Activates the GoogleMaps map, i.e. put it in the ol3 map target and put
 * the ol3 map inside the gmap controls.
 * @private
 */
olgm.herald.Layers.prototype.activateGoogleMaps_ = function() {

  var center = this.ol3map.getView().getCenter();
  if (this.googleMapsIsActive_ || !this.ol3mapIsRenderered_ || !center) {
    return;
  }

  this.targetEl_.removeChild(this.ol3mapEl_);
  this.targetEl_.appendChild(this.gmapEl_);
  this.gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(
      this.ol3mapEl_);

  this.viewHerald_.activate();

  // the map div of GoogleMaps doesn't like being tossed aroud. The line
  // below fixes the UI issue of wrong size of the tiles of GoogleMaps
  google.maps.event.trigger(this.gmap, 'resize');

  // it's also possible that the google maps map is not exactly at the
  // correct location. Fix this manually here
  this.viewHerald_.setCenter();
  this.viewHerald_.setZoom();

  this.googleMapsIsActive_ = true;

  // activate all cache items
  this.vectorCache_.forEach(this.activateVectorLayerCacheItem_, this);
  this.tileWMSCache_.forEach(this.activateTileWMSLayerCacheItem_, this);
  this.imageWMSCache_.forEach(this.activateImageWMSLayerCacheItem_, this);
};


/**
 * Deactivates the GoogleMaps map, i.e. put the ol3 map back in its target
 * and remove the gmap map.
 * @private
 */
olgm.herald.Layers.prototype.deactivateGoogleMaps_ = function() {

  if (!this.googleMapsIsActive_) {
    return;
  }

  this.gmap.controls[google.maps.ControlPosition.TOP_LEFT].removeAt(0);
  this.targetEl_.removeChild(this.gmapEl_);
  this.targetEl_.appendChild(this.ol3mapEl_);

  this.viewHerald_.deactivate();

  this.ol3mapEl_.style.position = 'relative';

  // deactivate all cache items
  this.vectorCache_.forEach(this.deactivateVectorLayerCacheItem_, this);
  this.tileWMSCache_.forEach(this.deactivateTileWMSLayerCacheItem_, this);
  this.imageWMSCache_.forEach(this.deactivateImageWMSLayerCacheItem_, this);

  this.googleMapsIsActive_ = false;
};


/**
 * This method takes care of activating or deactivating the GoogleMaps map.
 * It is activated if at least one visible Google layer is currently in the
 * ol3 map (and vice-versa for deactivation). The top-most layer is used
 * to determine that. It is also used to change the GoogleMaps mapTypeId
 * accordingly too to fit the top-most ol3 Google layer.
 * @private
 */
olgm.herald.Layers.prototype.toggleGoogleMaps_ = function() {

  var found = null;

  // find top-most Google layer
  this.ol3map.getLayers().getArray().slice(0).reverse().every(
      function(layer) {
        if (layer instanceof olgm.layer.Google &&
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
    var styles = found.getStyles();
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
 * Activates an image WMS layer cache item.
 * @param {olgm.herald.Layers.ImageWMSLayerCache} cacheItem
 * @private
 */
olgm.herald.Layers.prototype.activateImageWMSLayerCacheItem_ = function(
    cacheItem) {
  var layer = cacheItem.layer;
  var visible = layer.getVisible();
  if (visible && this.googleMapsIsActive_) {
    cacheItem.lastUrl = null;
    cacheItem.layer.setOpacity(0);
    this.updateImageOverlay_(cacheItem);
  }
};


/**
 * Deactivates an Image WMS layer cache item.
 * @param {olgm.herald.Layers.ImageWMSLayerCache} cacheItem
 * @private
 */
olgm.herald.Layers.prototype.deactivateImageWMSLayerCacheItem_ = function(
    cacheItem) {
  if (cacheItem.imageOverlay) {
    cacheItem.imageOverlay.setMap(null);
    cacheItem.imageOverlay = null;
  }
  cacheItem.layer.setOpacity(cacheItem.opacity);
};


/**
 * Activates a tiled WMS layer cache item.
 * @param {olgm.herald.Layers.TileWMSLayerCache} cacheItem
 * @private
 */
olgm.herald.Layers.prototype.activateTileWMSLayerCacheItem_ = function(
    cacheItem) {
  var layer = cacheItem.layer;
  var visible = layer.getVisible();
  if (visible && this.googleMapsIsActive_) {
    cacheItem.layer.setOpacity(0);
  }
};


/**
 * Deactivates a tiled WMS layer cache item.
 * @param {olgm.herald.Layers.TileWMSLayerCache} cacheItem
 * @private
 */
olgm.herald.Layers.prototype.deactivateTileWMSLayerCacheItem_ = function(
    cacheItem) {
  cacheItem.layer.setOpacity(cacheItem.opacity);
};


/**
 * Activates a vector layer cache item, i.e. activate its herald and
 * render the layer invisible. Will only do so if the layer is visible.
 * @param {olgm.herald.Layers.VectorLayerCache} cacheItem
 * @private
 */
olgm.herald.Layers.prototype.activateVectorLayerCacheItem_ = function(
    cacheItem) {
  var layer = cacheItem.layer;
  var visible = layer.getVisible();
  if (visible && this.googleMapsIsActive_) {
    cacheItem.herald.activate();
    cacheItem.layer.setOpacity(0);
  }
};


/**
 * Deactivates a vector layer cache item, i.e. deactivate its herald and
 * restore the layer opacity.
 * @param {olgm.herald.Layers.VectorLayerCache} cacheItem
 * @private
 */
olgm.herald.Layers.prototype.deactivateVectorLayerCacheItem_ = function(
    cacheItem) {
  cacheItem.herald.deactivate();
  cacheItem.layer.setOpacity(cacheItem.opacity);
};


/**
 * Deal with the google WMS layer when we enable or disable the OL3 WMS layer
 * @param {olgm.herald.Layers.TileWMSLayerCache} cacheItem
 * @private
 */
olgm.herald.Layers.prototype.handleTileWMSLayerVisibleChange_ = function(
    cacheItem) {
  var layer = cacheItem.layer;
  var visible = layer.getVisible();

  var googleWMSLayer = cacheItem.googleWMSLayer;
  var googleMapsLayers = this.gmap.overlayMapTypes;

  // Get the position of the google layer so we can remove it
  var layerIndex = googleMapsLayers.getArray().indexOf(googleWMSLayer);

  if (visible) {
    // Add the google WMS layer only if it's not there already
    if (layerIndex == -1) {
      googleMapsLayers.push(googleWMSLayer);
    }
    this.activateTileWMSLayerCacheItem_(cacheItem);
  } else {
    // Remove the google WMS layer from the map if it hasn't been done already
    if (layerIndex != -1) {
      googleMapsLayers.removeAt(layerIndex);
    }
    this.deactivateTileWMSLayerCacheItem_(cacheItem);
  }
};


/**
 * Deal with the google WMS layer when we enable or disable the OL3 WMS layer
 * @param {olgm.herald.Layers.ImageWMSLayerCache} cacheItem
 * @private
 */
olgm.herald.Layers.prototype.handleImageWMSLayerVisibleChange_ = function(
    cacheItem) {
  var layer = cacheItem.layer;
  var visible = layer.getVisible();

  if (visible) {
    this.activateImageWMSLayerCacheItem_(cacheItem);
  } else {
    this.deactivateImageWMSLayerCacheItem_(cacheItem);
  }
};


/**
 * Refresh the custom image overlay on google maps
 * @param {olgm.herald.Layers.ImageWMSLayerCache} cacheItem
 * @private
 */
olgm.herald.Layers.prototype.updateImageOverlay_ = function(cacheItem) {
  var layer = cacheItem.layer;
  var url = this.generateImageWMSFunction_(layer);

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
  var view = this.ol3map.getView();
  var size = this.ol3map.getSize();

  goog.asserts.assert(size !== undefined);

  var extent = view.calculateExtent(size);

  // First, get the coordinates of the top left corner
  var topLeft = ol.extent.getTopLeft(extent);

  // Then, convert it to LatLng coordinates for google
  var lngLat = ol.proj.transform(topLeft, 'EPSG:3857', 'EPSG:4326');
  var topLeftLatLng = new google.maps.LatLng(lngLat[1], lngLat[0]);

  var overlay = new olgm.gm.ImageOverlay(
      url,
      size,
      topLeftLatLng);

  // Set the new overlay right away to give it time to render
  overlay.setMap(this.gmap);

  // Clean previous overlay
  if (cacheItem.imageOverlay) {
    // Remove the overlay from the map
    cacheItem.imageOverlay.setMap(null);

    // Destroy the overlay
    cacheItem.imageOverlay = null;
  }

  // Save new overlay
  cacheItem.imageOverlay = overlay;
};


/**
 * Handle the map being panned when an ImageWMS layer is present
 * @param {olgm.herald.Layers.ImageWMSLayerCache} cacheItem
 * @private
 */
olgm.herald.Layers.prototype.handleImageWMSMoveEnd_ = function(
    cacheItem) {
  if (cacheItem.layer.getVisible()) {
    this.updateImageOverlay_(cacheItem);
  }
};


/**
 * @param {olgm.herald.Layers.VectorLayerCache} cacheItem
 * @private
 */
olgm.herald.Layers.prototype.handleVectorLayerVisibleChange_ = function(
    cacheItem) {
  var layer = cacheItem.layer;
  var visible = layer.getVisible();
  if (visible) {
    this.activateVectorLayerCacheItem_(cacheItem);
  } else {
    this.deactivateVectorLayerCacheItem_(cacheItem);
  }
};


/**
 * @typedef {{
 *   layer: (olgm.layer.Google),
 *   listenerKeys: (Array.<ol.events.Key|Array.<ol.events.Key>>)
 * }}
 */
olgm.herald.Layers.GoogleLayerCache;


/**
 * @typedef {{
 *   data: (google.maps.Data),
 *   herald: (olgm.herald.VectorSource),
 *   layer: (ol.layer.Vector),
 *   listenerKeys: (Array.<ol.events.Key|Array.<ol.events.Key>>),
 *   opacity: (number)
 * }}
 */
olgm.herald.Layers.VectorLayerCache;


/**
 * @typedef {{
 *   googleWMSLayer: (google.maps.ImageMapType),
 *   layer: (ol.layer.Tile),
 *   listenerKeys: (Array.<ol.events.Key|Array.<ol.events.Key>>),
 *   opacity: (number)
 * }}
 */
olgm.herald.Layers.TileWMSLayerCache;


/**
 * @typedef {{
 *   imageOverlay: (olgm.gm.ImageOverlay),
 *   lastUrl: (string|null),
 *   layer: (ol.layer.Image),
 *   listenerKeys: (Array.<ol.events.Key|Array.<ol.events.Key>>),
 *   opacity: (number)
 * }}
 */
olgm.herald.Layers.ImageWMSLayerCache;
