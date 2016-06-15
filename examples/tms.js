var center = [-10997148, 4569099];

var googleLayer = new olgm.layer.Google();

var osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: false
});

var tmsLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'http://v3.cartalib.mapgears.com/mapcache/tms/1.0.0/' +
        'mapgears_basemap@g/{z}/{x}/{-y}.'
  }),
  opacity: 1
});

var map = new ol.Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: olgm.interaction.defaults(),
  layers: [
    googleLayer,
    osmLayer,
    tmsLayer
  ],
  target: 'map',
  view: new ol.View({
    center: center,
    zoom: 4
  })
});

var olGM = new olgm.OLGoogleMaps({map: map}); // map is the ol.Map instance
olGM.activate();

function toggleOSM() {
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
};
