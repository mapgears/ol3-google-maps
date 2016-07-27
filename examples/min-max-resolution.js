var center = [-10997148, 4569099];

var googleLayer = new olgm.layer.Google();

var osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: false
});

var tileJSONLayer = new ol.layer.Tile({
  source: new ol.source.TileJSON({
    url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.json',
    crossOrigin: 'anonymous'
  }),
  minResolution: 4000,
  maxResolution: 10000
});

var imageWMSLayer = new ol.layer.Image({
  extent: [-13884991, 2870341, -7455066, 6338219],
  source: new ol.source.ImageWMS({
    url: 'http://demo.boundlessgeo.com/geoserver/wms',
    params: {'LAYERS': 'topp:states', 'TILED': true},
    serverType: 'geoserver'
  }),
  minResolution: 4000,
  maxResolution: 10000
});

var vectorSource = new ol.source.Vector();
var markers = [];

for (var i = 0; i < 50; i++) {
  var x = Math.floor((Math.random() * -18000000));
  var y =  Math.floor((Math.random() * 10000000));
  var marker = new ol.Feature(new ol.geom.Point([x, y]));
  marker.setStyle(new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'data/icon.png'
      }))
    })
  );
  markers.push(marker);
}

vectorSource.addFeatures(markers);
var vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  minResolution: 4000,
  maxResolution: 10000
});

var map = new ol.Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: olgm.interaction.defaults(),
  layers: [
    googleLayer,
    osmLayer,
    tileJSONLayer,
    imageWMSLayer,
    vectorLayer
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
