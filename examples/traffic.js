var center = [-7908084, 6177492];

// This dummy layer tells Google Maps to switch to its default map type
var googleLayer = new olgm.layer.Google();

var map = new ol.Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: olgm.interaction.defaults(),
  layers: [
    googleLayer
  ],
  target: 'map',
  view: new ol.View({
    center: center,
    zoom: 12
  })
});

var olGM = new olgm.OLGoogleMaps({map: map}); // map is the ol.Map instance
olGM.activate();

var gmap = olGM.getGoogleMapsMap();

var trafficLayer = new google.maps.TrafficLayer();
trafficLayer.setMap(gmap);
