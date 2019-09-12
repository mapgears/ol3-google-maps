/**
 * @module olgm/interaction
 */
import {defaults as olDefaults} from 'ol/interaction.js';
import DragPan from 'ol/interaction/DragPan.js';


/**
 * Set of interactions that are recommended to include in ol3 maps used
 * by this library. It basically is the same as the default interactions
 * included in such maps by default, with the exclusion of some that are
 * not compatible with this library.
 *
 * Here's the one that are excluded and why:
 * * `ol.interaction.DragRotate` - Google Maps doesn't support the same kind
 *   of rotation that OL3 does.
 * * `ol.interaction.PinchRotate` - Google Maps doesn't support the same kind
 *   of rotation that OL3 does.
 * * `ol.interaction.DragPan` - The one created by OL3 includes kinetic
 *   animation while panning, which causes animation not being syncrhonized
 *   with Google Maps. It is excluded, but also replace by one that doesn't
 *   have kinetic enabled.
 * * `ol.interaction.MouseWheelZoom` - By default, OL uses a zoom animation
 *   that is causing a lag before zooming starts. It is deactivated by setting
 *   its duration to 0. Without this change, a temporary 'shift' effect is also
 *   visible when zooming; this change prevents this artefact as well.
 *
 * @param {module:ol/interaction/Interaction~DefaultsOptions=} opt_options Defaults options.
 * @return {module:ol/Collection<ol.interaction.Interaction>} A collection of
 * interactions to be used with the module:ol/PluggableMap constructor's interactions option.
 * @api stable
 */
export function defaults(opt_options) {

  const options = (opt_options !== undefined) ? opt_options : {};

  options['altShiftDragRotate'] = false;
  options['dragPan'] = false;
  options['pinchRotate'] = false;
  options['zoomDuration'] = 0;

  return olDefaults(options).extend([
    new DragPan()
  ]);

}
