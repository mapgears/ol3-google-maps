goog.provide('olgm.test.OLGoogleMaps');

describe('olgm.OLGoogleMaps', function() {
  describe('constructor', function() {
    var map = new ol.Map({});

    it('creates a new OLGoogleMaps object', function() {
      var olGM = new olgm.OLGoogleMaps({map: map});
      expect(olGM).to.be.an.instanceof(olgm.OLGoogleMaps);
    });
  });
});
