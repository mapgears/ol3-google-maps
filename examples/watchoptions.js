var center = [-10997148, 4569099];

var googleLayer = new olgm.layer.Google();

var osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: false
});

var imageWMSLayer = new ol.layer.Image({
  source: new ol.source.ImageWMS({
    url: 'http://demo.boundlessgeo.com/geoserver/wms',
    params: {'LAYERS': 'topp:states', 'TILED': true},
    serverType: 'geoserver'
  })
})

var tileWMSLayer  =  new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: 'http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en',
    params: {'LAYERS': 'limits', 'TILED': true},
    serverType: 'geoserver'
  })
});

var source = new ol.source.Vector();

var watchOptions = {
  'image': false,
  'tile': false,
  'vector': false
};

// Add some randomly generated markers
var markers = [];

for (var i = 0; i < 10; i++) {
  var x = Math.floor((Math.random() * 1000000) - 10997148);
  var y =  Math.floor((Math.random() * 1000000) + 4569099);
  var marker = new ol.Feature(new ol.geom.Point([x, y]));
  marker.setStyle(new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'data/icon.png'
      })),
      zIndex: i
    })
  );
  markers.push(marker);
}

source.addFeatures(markers);

var vector = new ol.layer.Vector({
  source: source
});

var map = new ol.Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: olgm.interaction.defaults(),
  layers: [
    osmLayer,
    tileWMSLayer,
    imageWMSLayer,
    googleLayer,
    vector
  ],
  target: 'map',
  view: new ol.View({
    center: center,
    zoom: 4
  })
});

var olGM = new olgm.OLGoogleMaps({
  map: map,
  watch: watchOptions
}); // map is the ol.Map instance
olGM.activate();


function toggle() {
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
};

function toggleWatch(option) {
  watchOptions[option] = !watchOptions[option];
  var cell = document.getElementById(option);
  var className = watchOptions[option] == true ? 'active' : 'inactive';
  cell.className = className;
  olGM.setWatchOptions(watchOptions);
};
