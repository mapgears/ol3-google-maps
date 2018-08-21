/**
 * @module olgm/herald/View
 */
import {transform} from 'ol/proj.js';
import {getZoomFromResolution} from '../util.js';
import {listen} from '../events.js';
import Herald from './Herald.js';

class ViewHerald extends Herald {
  /**
   * The View Herald is responsible of synchronizing the view (center/zoom)
   * of boths maps together. The ol3 map view is the master here, i.e. changes
   * from the ol3 map view are given to the gmap map, but not vice-versa.
   *
   * When the browser window gets resized, the gmap map is also updated.
   *
   * @param {module:ol/PluggableMap} ol3map openlayers map
   * @param {google.maps.Map} gmap google maps map
   */
  constructor(ol3map, gmap) {
    super(ol3map, gmap);

    /**
     * On window resize, the GoogleMaps map gets recentered. To avoid doing this
     * too often, a timeout is set.
     * @type {?number}
     * @private
     */
    this.windowResizeTimerId_ = null;
  }


  /**
   * @inheritDoc
   */
  activate() {
    super.activate();

    const view = this.ol3map.getView();
    const keys = this.listenerKeys;

    // listen to center change
    keys.push(view.on('change:center', () => this.setCenter()));

    // listen to resolution change
    keys.push(view.on('change:resolution', () => this.setZoom()));

    // listen to rotation change
    keys.push(view.on('change:rotation', () => this.setRotation()));

    // listen to browser window resize
    this.olgmListenerKeys.push(listen(
      window,
      'resize',
      this.handleWindowResize_,
      this,
      false));

    // Rotate and recenter the map after it's ready
    google.maps.event.addListenerOnce(this.gmap, 'idle', () => {
      this.setRotation();
      this.setCenter();
      this.setZoom();
    });
  }


  /**
   * @inheritDoc
   */
  deactivate() {
    super.deactivate();
  }


  /**
   * Recenter the gmap map at the ol3 map center location.
   */
  setCenter() {
    const view = this.ol3map.getView();
    const projection = view.getProjection();
    const center = view.getCenter();
    if (Array.isArray(center)) {
      const [lng, lat] = transform(center, projection, 'EPSG:4326');
      this.gmap.setCenter(new google.maps.LatLng(lat, lng));
    }
  }


  /**
   * Rotate the gmap map like the ol3 map. The first time it is ran, the map
   * will be resized to be a square.
   */
  setRotation() {
    const view = this.ol3map.getView();
    const rotation = view.getRotation();

    const mapDiv = this.gmap.getDiv();
    const tilesDiv = mapDiv.childNodes[0].childNodes[0];

    // If googlemaps is fully loaded
    if (tilesDiv) {

      // Rotate the div containing the map tiles
      const tilesDivStyle = tilesDiv.style;
      tilesDivStyle.transform = 'rotate(' + rotation + 'rad)';

      const width = this.ol3map.getSize()[0];
      const height = this.ol3map.getSize()[1];

      // Change the size of the rendering area to a square
      if (width != height && rotation != 0) {
        const sideSize = Math.max(width, height);
        const mapDivStyle = mapDiv.style;
        mapDivStyle.width = sideSize + 'px';
        mapDivStyle.height = sideSize + 'px';

        // Hide the overflow
        this.ol3map.getTargetElement().style.overflow = 'hidden';

        // Adjust the map's center to offset with the new size
        const diffX = width - sideSize;
        const diffY = height - sideSize;

        tilesDivStyle.top = (diffY / 2) + 'px';
        tilesDivStyle.left = (diffX / 2) + 'px';

        // Trigger a resize event
        google.maps.event.trigger(this.gmap, 'resize');

        // Replace the map
        this.setCenter();
        this.setZoom();

        // Move up the elements at the bottom of the map
        const childNodes = mapDiv.childNodes[0].childNodes;
        for (let i = 0; i < childNodes.length; i++) {
          // Set the bottom to where the overflow starts being hidden
          const style = childNodes[i].style;
          if (style.bottom == '0px') {
            style.bottom = Math.abs(diffY) + 'px';
          }
        }

        // Set the ol3map's viewport size to px instead of 100%
        const viewportStyle = this.ol3map.getViewport().style;
        if (viewportStyle.height == '100%') {
          viewportStyle.height = height + 'px';
        }
      }
    }
  }


  /**
   * Set the gmap map zoom level at the ol3 map view zoom level.
   */
  setZoom() {
    const resolution = this.ol3map.getView().getResolution();
    if (typeof resolution === 'number') {
      const zoom = getZoomFromResolution(resolution);
      this.gmap.setZoom(zoom);
    }
  }


  /**
   * Called when the browser window is resized. Set the center of the GoogleMaps
   * map after a slight delay.
   * @private
   */
  handleWindowResize_() {
    if (this.windowResizeTimerId_) {
      window.clearTimeout(this.windowResizeTimerId_);
    }
    this.windowResizeTimerId_ = window.setTimeout(
      this.setCenterAfterResize_.bind(this),
      100);
  }


  /**
   * Called after the browser window got resized, after a small delay.
   * Set the center of the GoogleMaps map and reset the timeout.
   * @private
   */
  setCenterAfterResize_() {
    this.setCenter();
    this.windowResizeTimerId_ = null;
  }
}
export default ViewHerald;
