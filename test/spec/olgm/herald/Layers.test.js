import Map from 'ol/Map.js';
import Layers from 'olgm/herald/Layers.js';

describe('olgm.herald.Layers', function() {
  // Setup constructor variables
  const originalOl3map = new Map({});
  const gmapEl = document.createElement('div');
  gmapEl.style.height = '100px';
  gmapEl.style.width = '100px';
  const originalGmap = new google.maps.Map(gmapEl);
  const watchVector = true;

  describe('constructor', function() {
    const layersHerald = new Layers(
      originalOl3map, originalGmap, watchVector);

    it('sets the Google Maps map', function() {
      const gmap = layersHerald.gmap;
      expect(gmap).to.be.an.instanceof(google.maps.Map);
      expect(gmap).to.equal(originalGmap);
    });

    it('sets the OpenLayers map', function() {
      const ol3map = layersHerald.ol3map;
      expect(ol3map).to.be.an.instanceof(Map);
      expect(ol3map).to.equal(originalOl3map);
    });
  });
});
