var center = [-9458084, 5877492];

// This dummy layer tells Google Maps to switch to its default map type
var googleLayer = new olgm.layer.Google();
var osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: false
});

//Add simple multilinestring example
var source = new ol.source.Vector();
var feature = new ol.Feature(
  new ol.geom.MultiLineString([
    [
      [-9665988,6059810], 
      [-9763828,6020579],
      [-9862221,6009674],
      [-9953124,6000121]
    ], 
    [
      [-9582825,6103837],
      [-9503905,6089162],
      [-9425805,6209875],
      [-9313742,6529403]
    ]
  ])
);

feature.setStyle(
  new ol.style.Style({
    fill: new ol.style.Fill({
      color: [0, 0, 195, 0.1]
    }),
    stroke: new ol.style.Stroke({
      color: [0, 0, 195, 1],
      width: 5
    })
  })
);
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
    zoom: 6
  })
});

var olGM = new olgm.OLGoogleMaps({map: map}); // map is the ol.Map instance
olGM.activate();

function toggle() {
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
};