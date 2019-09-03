/**
 * @module olgm/gm/MapIcon
 */
import MapElement from './MapElement.js';

/**
 * @typedef {Object} Options
 * @property {boolean} [useCanvas] Whether or not we should draw on canvases when we can, instead of using the Google Maps API. This fixes z-index issues with labels on margers
 */

/**
 * @classdesc
 * @api
 */
class MapIcon extends MapElement {
  /**
   * Creates a new map icon
   * @param {module:ol/style/Icon} imageStyle ol3 style properties
   * @param {Object<string, *>=} opt_options Optional properties to set.
   */
  constructor(imageStyle, opt_options) {
    super();

    /**
     * This object contains the ol3 style properties for the icon. We keep
     * it as an object because its properties can change, for example the size
     * is only defined after the image is done loading.
     * @type {module:ol/style/Icon}
     * @private
     */
    this.imageStyle_ = imageStyle;

    this.setValues(opt_options);
  }


  /**
   * Listen to property changes and react accordingly
   * @param {string} prop property
   * @api
   * @override
   */
  changed(prop) {
    switch (prop) {
      case 'maxZoom':
      case 'minZoom':
      case 'offsetX':
      case 'offsetY':
      case 'position':
        this.draw();
        break;
      default:
        break;
    }
  }


  /**
   * Draws the icon to the canvas 2d context.
   * @private
   */
  drawCanvas_() {
    const canvas = this.canvas_;
    if (!canvas) {
      return;
    }

    const image = this.imageStyle_.getImage(1);
    if (!image) {
      return;
    }

    const style = canvas.style;

    style.zIndex = /** @type {number} */ (this.get('zIndex'));

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const anchor = this.imageStyle_.getAnchor() || [0, 0];
    const scale = this.imageStyle_.getScale() || 1;
    const rotation = this.imageStyle_.getRotation() || 0;
    const opacity = this.imageStyle_.getOpacity() || 1;

    const offsetX = anchor[0] * scale;
    const offsetY = anchor[1] * scale;

    const x = canvas.width / 2 - offsetX;
    const y = canvas.height / 2 - offsetY;

    ctx.translate(x + offsetX, y + offsetY);
    ctx.rotate(rotation);
    ctx.translate(-x - offsetX, -y - offsetY);
    ctx.globalAlpha = opacity;

    ctx.drawImage(image, x, y,
      image.width * scale, image.height * scale);
  }


  /**
   * Manage feature being added to the map
   * @api
   * @override
   */
  onAdd() {
    const canvas = this.canvas_ = document.createElement('canvas');
    const style = canvas.style;
    style.position = 'absolute';

    this.drawCanvas_();

    const panes = this.getPanes();
    if (panes) {
      let pane = this.get('olgm_pane');
      if (pane) {
        pane = panes[pane];
      }
      if (!pane) {
        pane = panes.markerLayer;
      }

      pane.appendChild(canvas);
    }
  }
}
export default MapIcon;
