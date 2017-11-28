goog.provide('olgm.herald.View');

goog.require('ol');
goog.require('ol.proj');
goog.require('olgm');
goog.require('olgm.events');
goog.require('olgm.herald.Herald');


/**
 * The View Herald is responsible of synchronizing the view (center/zoom)
 * of boths maps together. The ol3 map view is the master here, i.e. changes
 * from the ol3 map view are given to the gmap map, but not vice-versa.
 *
 * When the browser window gets resized, the gmap map is also updated.
 *
 * @param {!ol.Map} ol3map openlayers map
 * @param {!google.maps.Map} gmap google maps map
 * @constructor
 * @extends {olgm.herald.Herald}
 */
olgm.herald.View = function(ol3map, gmap) {
  olgm.herald.Herald.call(this, ol3map, gmap);
};
ol.inherits(olgm.herald.View, olgm.herald.Herald);


/**
 * On window resize, the GoogleMaps map gets recentered. To avoid doing this
 * too often, a timeout is set.
 * @type {?number}
 * @private
 */
olgm.herald.View.prototype.windowResizeTimerId_ = null;


/**
 * @inheritDoc
 */
olgm.herald.View.prototype.activate = function() {

  olgm.herald.Herald.prototype.activate.call(this);

  var view = this.ol3map.getView();
  var keys = this.listenerKeys;

  // listen to center change
  keys.push(view.on('change:center', this.setCenter, this));

  // listen to resolution change
  keys.push(view.on('change:resolution', this.setZoom, this));

  // listen to rotation change
  keys.push(view.on('change:rotation', this.setRotation, this));

  // listen to browser window resize
  this.olgmListenerKeys.push(olgm.events.listen(
      window,
      'resize',
      this.handleWindowResize_,
      this,
      false));

  // Rotate and recenter the map after it's ready
  google.maps.event.addListenerOnce(this.gmap, 'idle', (function() {
    this.setRotation();
    this.setCenter();
    this.setZoom();
  }).bind(this));
};


/**
 * @inheritDoc
 */
olgm.herald.View.prototype.deactivate = function() {
  olgm.herald.Herald.prototype.deactivate.call(this);
};


/**
 * Recenter the gmap map at the ol3 map center location.
 */
olgm.herald.View.prototype.setCenter = function() {
  var view = this.ol3map.getView();
  var projection = view.getProjection();
  var center = view.getCenter();
  if (Array.isArray(center)) {
    center = ol.proj.transform(center, projection, 'EPSG:4326');
    this.gmap.setCenter(new google.maps.LatLng(center[1], center[0]));
  }
};


/**
 * Rotate the gmap map like the ol3 map. The first time it is ran, the map
 * will be resized to be a square.
 */
olgm.herald.View.prototype.setRotation = function() {
  var view = this.ol3map.getView();
  var rotation = view.getRotation();

  var mapDiv = this.gmap.getDiv();
  var tilesDiv = mapDiv.childNodes[0].childNodes[0];

  // If googlemaps is fully loaded
  if (tilesDiv) {

    // Rotate the div containing the map tiles
    var tilesDivStyle = tilesDiv.style;
    tilesDivStyle.transform = 'rotate(' + rotation + 'rad)';

    var width = this.ol3map.getSize()[0];
    var height = this.ol3map.getSize()[1];

    // Change the size of the rendering area to a square
    if (width != height && rotation != 0) {
      var sideSize = Math.max(width, height);
      var mapDivStyle = mapDiv.style;
      mapDivStyle.width = sideSize + 'px';
      mapDivStyle.height = sideSize + 'px';

      // Hide the overflow
      this.ol3map.getTargetElement().style.overflow = 'hidden';

      // Adjust the map's center to offset with the new size
      var diffX = width - sideSize;
      var diffY = height - sideSize;

      tilesDivStyle.top = (diffY / 2) + 'px';
      tilesDivStyle.left = (diffX / 2) + 'px';

      // Trigger a resize event
      google.maps.event.trigger(this.gmap, 'resize');

      // Replace the map
      this.setCenter();
      this.setZoom();

      // Move up the elements at the bottom of the map
      var childNodes = mapDiv.childNodes[0].childNodes;
      for (var i = 0; i < childNodes.length; i++) {
        // Set the bottom to where the overflow starts being hidden
        var style = childNodes[i].style;
        if (style.bottom == '0px') {
          style.bottom = Math.abs(diffY) + 'px';
        }
      }

      // Set the ol3map's viewport size to px instead of 100%
      var viewportStyle = this.ol3map.getViewport().style;
      if (viewportStyle.height == '100%') {
        viewportStyle.height = height + 'px';
      }
    }
  }
};


/**
 * Set the gmap map zoom level at the ol3 map view zoom level.
 */
olgm.herald.View.prototype.setZoom = function() {
  var resolution = this.ol3map.getView().getResolution();
  if (typeof resolution === 'number') {
    var zoom = olgm.getZoomFromResolution(resolution);
    this.gmap.setZoom(zoom);
  }
};


/**
 * Called when the browser window is resized. Set the center of the GoogleMaps
 * map after a slight delay.
 * @private
 */
olgm.herald.View.prototype.handleWindowResize_ = function() {
  if (this.windowResizeTimerId_) {
    window.clearTimeout(this.windowResizeTimerId_);
  }
  this.windowResizeTimerId_ = window.setTimeout(
      this.setCenterAfterResize_.bind(this),
      100);
};


/**
 * Called after the browser window got resized, after a small delay.
 * Set the center of the GoogleMaps map and reset the timeout.
 * @private
 */
olgm.herald.View.prototype.setCenterAfterResize_ = function() {
  this.setCenter();
  this.windowResizeTimerId_ = null;
};
