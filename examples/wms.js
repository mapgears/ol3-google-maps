var center = [-10997148, 4569099];

var googleLayer = new olgm.layer.Google();

var osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: false
});

var tileWMSLayer  =  new ol.layer.Tile({
  extent: [-13884991, 2870341, -7455066, 6338219],
  source: new ol.source.TileWMS({
    url: 'http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en',
    params: {'LAYERS': 'limits', 'TILED': true},
    serverType: 'geoserver'
  }),
  visible: true
});

var tileWMSLayer2  =  new ol.layer.Tile({
  extent: [-13884991, 2870341, -7455066, 6338219],
  source: new ol.source.TileWMS({
    url: 'http://demo.boundlessgeo.com/geoserver/wms',
    params: {'LAYERS': 'topp:states', 'TILED': true},
    serverType: 'geoserver'
  }),
  visible: true
});

var imageWMSLayer = new ol.layer.Image({
  extent: [-13884991, 2870341, -7455066, 6338219],
  source: new ol.source.ImageWMS({
    url: 'http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en',
    params: {'LAYERS': 'limits', 'TILED': true},
    serverType: 'geoserver'
  }),
  visible: false
})

var imageWMSLayer2 = new ol.layer.Image({
  extent: [-13884991, 2870341, -7455066, 6338219],
  source: new ol.source.ImageWMS({
    url: 'http://demo.boundlessgeo.com/geoserver/wms',
    params: {'LAYERS': 'topp:states', 'TILED': true},
    serverType: 'geoserver'
  }),
  visible: false
})

var map = new ol.Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: olgm.interaction.defaults(),
  layers: [
    googleLayer,
    osmLayer,
    tileWMSLayer,
    tileWMSLayer2,
    imageWMSLayer,
    imageWMSLayer2
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

function toggleWMS() {
  tileWMSLayer.setVisible(!tileWMSLayer.getVisible());
  tileWMSLayer2.setVisible(!tileWMSLayer2.getVisible());
  imageWMSLayer.setVisible(!imageWMSLayer.getVisible());
  imageWMSLayer2.setVisible(!imageWMSLayer2.getVisible());
  var spanText = tileWMSLayer.getVisible() ? 'tiled' : 'image';
  document.getElementById('currentMode').innerHTML = spanText;
}

function setRandomParam() {
  var params = {
    'random': Math.random()
  };
  tileWMSLayer.getSource().updateParams(params);
  tileWMSLayer2.getSource().updateParams(params);
  imageWMSLayer.getSource().updateParams(params);
  imageWMSLayer2.getSource().updateParams(params);
};
