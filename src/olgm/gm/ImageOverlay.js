/**
 * @module olgm/gm/ImageOverlay
 */
/**
 * @classdesc
 * @api
 */
class ImageOverlay extends ((window.google && window.google.maps && google.maps.OverlayView) || Object) {
  /**
   * Creates a new image overlay.
   * @param {string} src url to the image
   * @param {Array<number>} size size of the image
   * @param {google.maps.LatLng} topLeft topLeft corner
   */
  constructor(src, size, topLeft) {
    super();

    /**
     * @type {string}
     * @private
     */
    this.src_ = src;

    /**
     * @type {Array<number>}
     * @private
     */
    this.size_ = size;

    /**
     * @type {google.maps.LatLng}
     * @private
     */
    this.topLeft_ = topLeft;

    /**
     * @type {HTMLElement}
     * @private
     */
    this.div_ = null;

    /**
     * @type {number}
     * @private
     */
    this.zIndex_ = 0;
  }


  /**
   * Note: mark as `@api` to make the minimized version include this method.
   * @api
   * @override
   */
  onAdd() {
    const div = document.createElement('div');
    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';
    div.style.zIndex = this.zIndex_;

    // Create the img element and attach it to the div.
    const img = document.createElement('img');
    img.src = this.src_;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.position = 'absolute';
    div.appendChild(img);

    this.div_ = div;

    /**
     * Add the element to the "mapPane" pane. Normally we would put it in the
     * "overlayLayer" pane, but we want to be able to show it behind tile layers,
     * so we place them together in the same pane.
     */
    const panes = this.getPanes();
    panes.mapPane.appendChild(div);
  }


  /**
   * Note: mark as `@api` to make the minimized version include this method.
   * @api
   * @override
   */
  draw() {
    const div = this.div_;

    const sizeX = this.size_[0];
    const sizeY = this.size_[1];

    div.style.width = sizeX + 'px';
    div.style.height = sizeY + 'px';

    const overlayProjection = this.getProjection();
    const topLeftPx = overlayProjection.fromLatLngToDivPixel(this.topLeft_);

    let offsetX = topLeftPx.x;
    const offsetY = topLeftPx.y;

    // Adjust bad calculations when the view is larger than the world
    const worldWidth = overlayProjection.getWorldWidth();
    if (worldWidth < sizeX) {
      // Overlap of the map on each size
      const mapOverlap = Math.floor(sizeX / worldWidth) / 2;

      // For when only one map is overlapping
      const factor = Math.max(mapOverlap, 1);

      offsetX -= worldWidth * factor;
    }

    div.style.top = offsetY + 'px';
    div.style.left = offsetX + 'px';
  }


  /**
   * Set the zIndex for the div containing the image
   * @param {number} zIndex zIndex to set
   * @api
   */
  setZIndex(zIndex) {
    this.zIndex_ = zIndex;
    if (this.div_) {
      this.div_.style.zIndex = zIndex;
    }
  }


  /**
   * Note: mark as `@api` to make the minimized version include this method.
   * @api
   * @override
   */
  onRemove() {
    if (this.div_) {
      this.div_.parentNode.removeChild(this.div_);
      this.div_ = null;
    }
  }
}
export default ImageOverlay;
