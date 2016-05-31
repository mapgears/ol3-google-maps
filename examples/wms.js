var center = [-10997148, 4569099];

var googleLayer = new olgm.layer.Google();

var osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: false
});

var tileWMSLayer  =  new ol.layer.Tile({
  extent: [-13884991, 2870341, -7455066, 6338219],
  source: new ol.source.TileWMS({
    url: 'http://demo.boundlessgeo.com/geoserver/wms',
    params: {'LAYERS': 'topp:states', 'TILED': true},
    serverType: 'geoserver'
  }),
  visible: true
});

var map = new ol.Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: olgm.interaction.defaults(),
  layers: [
    googleLayer,
    osmLayer,
    tileWMSLayer
  ],
  target: 'map',
  view: new ol.View({
    center: center,
    zoom: 4
  })
});

var olGM = new olgm.OLGoogleMaps({map: map}); // map is the ol.Map instance
olGM.activate();

function toggle() {
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
};
