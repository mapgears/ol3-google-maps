goog.provide('olgm.test.OLGoogleMaps');

describe('olgm.OLGoogleMaps', function() {
  var target = document.createElement('div');
  var style = target.style;
  style.width = '300px';
  style.height = '300px';

  var view = new ol.View({
    center: [-7908084, 6177492],
    zoom: 12
  });

  describe('constructor', function() {
    var map = new ol.Map({});
    var olGM;

    it('creates a new OLGoogleMaps object', function() {
      olGM = new olgm.OLGoogleMaps({map: map});
      expect(olGM).to.be.an.instanceof(olgm.OLGoogleMaps);
    });

    it('creates the Google Maps map', function() {
      var gmap = olGM.gmap;
      expect(gmap).to.be.an.instanceof(google.maps.Map);
    });
  });

  describe('#activate()', function() {
    document.body.appendChild(target);
    var googleLayer = new olgm.layer.Google();
    var map = new ol.Map({
      layers: [
        googleLayer
      ],
      target: target,
      view: view
    });
    var olGM = new olgm.OLGoogleMaps({map: map});

    it('activates the heralds', function() {
      expect(olGM.getGoogleMapsActive()).to.be.false;
      olGM.activate();
      expect(olGM.getGoogleMapsActive()).to.be.true;
    });

    document.body.removeChild(target);
  });

  describe('#deactivate()', function() {
    document.body.appendChild(target);
    var googleLayer = new olgm.layer.Google();
    var map = new ol.Map({
      layers: [
        googleLayer
      ],
      target: target,
      view: view
    });
    var olGM = new olgm.OLGoogleMaps({map: map});

    olGM.activate();
    it('deactivates the heralds', function() {
      expect(olGM.getGoogleMapsActive()).to.be.true;
      olGM.deactivate();
      expect(olGM.getGoogleMapsActive()).to.be.false;
    });

    document.body.removeChild(target);
  });

  describe('#getGoogleMapsActive()', function() {
    document.body.appendChild(target);
    var googleLayer = new olgm.layer.Google();
    var map = new ol.Map({
      layers: [
        googleLayer
      ],
      target: target,
      view: view
    });
    var olGM = new olgm.OLGoogleMaps({map: map});

    it('returns true when Google Maps is active', function() {
      expect(olGM.getGoogleMapsActive()).to.be.false;
      olGM.activate();
      expect(olGM.getGoogleMapsActive()).to.be.true;
    });
    it('returns false when Google Maps is not active', function() {
      olGM.deactivate();
      expect(olGM.getGoogleMapsActive()).to.be.false;
      olGM.activate();
    });
    it('returns false when there is no Google Maps layer', function() {
      olGM.ol3map.removeLayer(googleLayer);
      expect(olGM.getGoogleMapsActive()).to.be.false;
    });

    document.body.removeChild(target);
  });

  describe('#getGoogleMapsMap()', function() {
    var map = new ol.Map({});
    var olGM = new olgm.OLGoogleMaps({map: map});

    it('returns the Google Maps map', function() {
      var gmap = olGM.gmap;
      expect(gmap).to.be.an.instanceof(google.maps.Map);
      expect(gmap).to.equal(olGM.getGoogleMapsMap());
    });
  });

  describe('#toggle()', function() {
    document.body.appendChild(target);
    var googleLayer = new olgm.layer.Google();
    var map = new ol.Map({
      layers: [
        googleLayer
      ],
      target: target,
      view: view
    });
    var olGM = new olgm.OLGoogleMaps({map: map});

    it('sets the OLGoogleMaps object to active when inactive', function() {
      expect(olGM.getGoogleMapsActive()).to.be.false;
      olGM.toggle();
      expect(olGM.getGoogleMapsActive()).to.be.true;
    });
    it('sets the OLGoogleMaps object to inactive when active', function() {
      expect(olGM.getGoogleMapsActive()).to.be.true;
      olGM.toggle();
      expect(olGM.getGoogleMapsActive()).to.be.false;
    });

    document.body.removeChild(target);
  });
});
