goog.provide('olgm.test.herald.Layers');

describe('olgm.herald.Layers', function() {
  // Setup constructor variables
  var originalOl3map = new ol.Map({});
  var gmapEl = document.createElement('div');
  gmapEl.style.height = '100px';
  gmapEl.style.width = '100px';
  var originalGmap = new google.maps.Map(gmapEl);
  var watchVector = true;

  describe('constructor', function() {
    var layersHerald = new olgm.herald.Layers(
        originalOl3map, originalGmap, watchVector);

    it('sets the Google Maps map', function() {
      var gmap = layersHerald.gmap;
      expect(gmap).to.be.an.instanceof(google.maps.Map);
      expect(gmap).to.equal(originalGmap);
    });

    it('sets the OpenLayers map', function() {
      var ol3map = layersHerald.ol3map;
      expect(ol3map).to.be.an.instanceof(ol.Map);
      expect(ol3map).to.equal(originalOl3map);
    });
  });

  describe('#activate()', function() {
    it('adds listener keys for layers added and removed', function() {
      var layersHerald = new olgm.herald.Layers(
          originalOl3map, originalGmap, watchVector);
      var listenerKeys = layersHerald.listenerKeys;
      var expectedNbListenerKeys = listenerKeys.length + 2;

      layersHerald.activate();

      expect(listenerKeys.length).to.equal(expectedNbListenerKeys);
    });
  });
});
