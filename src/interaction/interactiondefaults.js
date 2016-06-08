goog.provide('olgm.interaction');

goog.require('ol.interaction.DragPan');


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
 *
 * @param {olx.interaction.DefaultsOptions=} opt_options Defaults options.
 * @return {ol.Collection.<ol.interaction.Interaction>} A collection of
 * interactions to be used with the ol.Map constructor's interactions option.
 * @api stable
 */
olgm.interaction.defaults = function(opt_options) {

  var options = (opt_options !== undefined) ? opt_options : {};

  options['altShiftDragRotate'] = false;
  options['dragPan'] = false;
  options['pinchRotate'] = false;

  return ol.interaction.defaults(options).extend([
    new ol.interaction.DragPan()
  ]);

};
