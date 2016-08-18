goog.provide('olgm.gm.PanesOverlay');

/** @suppress {extraRequire} */
goog.require('ol.has');


/**
 * This overlay doesn't actually do anything, it's only a way to get the map's
 * panes since Google Maps' API doesn't offer any other way to do so.
 * @param {google.maps.Map} gmap Google Maps map
 * @constructor
 * @extends {google.maps.OverlayView}
 * @api
 */
olgm.gm.PanesOverlay = function(gmap) {
  this.setMap(gmap);
};
if (window.google && window.google.maps) {
  ol.inherits(olgm.gm.PanesOverlay, google.maps.OverlayView);
}


/**
 * This function is the only reason this class exists. It returns the panes.
 * @return {google.maps.MapPanes|undefined} array of panes
 * @api
 */
olgm.gm.PanesOverlay.prototype.getMapPanes = function() {
  return this.getPanes();
};


/**
 * Override parent function, but do not do anything
 * @api
 */
olgm.gm.PanesOverlay.prototype.onAdd = function() {

};


/**
 * Override parent function, but do not do anything
 * @api
 */
olgm.gm.PanesOverlay.prototype.draw = function() {

};


/**
 * Override parent function, but do not do anything
 * @api
 */
olgm.gm.PanesOverlay.prototype.onRemove = function() {

};
