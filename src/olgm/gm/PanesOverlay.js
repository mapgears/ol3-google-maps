/**
 * @module olgm/gm/PanesOverlay
 */
/**
 * @classdesc
 * @api
 */
class PanesOverlay extends ((window.google && window.google.maps && google.maps.OverlayView) || Object) {
  /**
   * This overlay doesn't actually do anything, it's only a way to get the map's
   * panes since Google Maps' API doesn't offer any other way to do so.
   * @param {google.maps.Map} gmap Google Maps map
   */
  constructor(gmap) {
    super();

    this.setMap(gmap);
  }


  /**
   * This function is the only reason this class exists. It returns the panes.
   * @return {google.maps.MapPanes|undefined} array of panes
   * @api
   */
  getMapPanes() {
    return this.getPanes();
  }


  /**
   * Override parent function, but do not do anything
   * @api
   * @override
   */
  onAdd() {

  }


  /**
   * Override parent function, but do not do anything
   * @api
   * @override
   */
  draw() {

  }


  /**
   * Override parent function, but do not do anything
   * @api
   * @override
   */
  onRemove() {

  }
}
export default PanesOverlay;
