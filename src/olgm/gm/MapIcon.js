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
   * Rotate a point around the origin by a given angle expressed as a (cos, sin) pair.
   * @private
   */

  rotate_(cosTheta, sinTheta, x, y) {
    return [x * cosTheta - y * sinTheta, x * sinTheta + y * cosTheta];
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

    const scale = this.imageStyle_.getScale() || 1;
    const anchor = this.imageStyle_.getAnchor() || [0, 0];
    const rotation = this.imageStyle_.getRotation() || 0;
    const opacity = this.imageStyle_.getOpacity() || 1;

    const offsetX = anchor[0] * scale;
    const offsetY = anchor[1] * scale;

    let w_2 = image.width * scale * 0.5;
    let h_2 = image.height * scale * 0.5;

    w_2 += Math.abs(w_2 - offsetX);
    h_2 += Math.abs(h_2 - offsetY);

    const cosTheta = Math.cos(rotation);
    const sinTheta = Math.sin(rotation);

    const p1 = this.rotate_(cosTheta, sinTheta, -w_2, -h_2);
    const p2 = this.rotate_(cosTheta, sinTheta, +w_2, -h_2);
    const p3 = this.rotate_(cosTheta, sinTheta, -w_2, +h_2);
    const p4 = this.rotate_(cosTheta, sinTheta, +w_2, +h_2);

    const minX = Math.min(p1[0], p2[0], p3[0], p4[0]);
    const maxX = Math.max(p1[0], p2[0], p3[0], p4[0]);
    const minY = Math.min(p1[1], p2[1], p3[1], p4[1]);
    const maxY = Math.max(p1[1], p2[1], p3[1], p4[1]);

    canvas.width = Math.round(maxX - minX);
    canvas.height = Math.round(maxY - minY);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
