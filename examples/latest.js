document.getElementById('google-maps-version').innerHTML = google.maps.version;

var center = [-7908084, 6177492];

var googleLayer = new olgm.layer.Google();

var osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: false
});

var source = new ol.source.Vector();
var feature = new ol.Feature(new ol.geom.Point(center));
feature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
      'fill': new ol.style.Fill({color: 'rgba(153,51,51,0.3)'}),
      'stroke': new ol.style.Stroke({color: 'rgb(153,51,51)', width: 2}),
      'radius': 20
    })
  }));
source.addFeature(feature);
var vector = new ol.layer.Vector({
  source: source
});

var map = new ol.Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: olgm.interaction.defaults(),
  layers: [
    googleLayer,
    osmLayer,
    vector
  ],
  target: 'map',
  view: new ol.View({
    center: center,
    zoom: 12
  })
});

var olGM = new olgm.OLGoogleMaps({map: map}); // map is the ol.Map instance
olGM.activate();


function toggle() {
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
};
