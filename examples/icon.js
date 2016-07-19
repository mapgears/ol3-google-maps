var center = [-7908084, 6177492];

var googleLayer = new olgm.layer.Google();

var osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: false
});

var source = new ol.source.Vector();
var feature = new ol.Feature(new ol.geom.Point(center));
feature.setStyle(new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      size: [32, 48],
      scale: 0.75,
      src: 'data/icon.png',
      rotation: 0.25 * Math.PI,
      opacity: 0.5
    }))
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

var olGM = new olgm.OLGoogleMaps({
  map: map,
  mapIconOptions: {
    useCanvas: true
  }}); // map is the ol.Map instance
olGM.activate();


function toggle() {
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
};
