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
  opacity: 0.5,
});

var tmsLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'http://v3.cartalib.mapgears.com/mapcache/tms/' +
        '1.0.0/mapgears_basemap@g/{z}/{x}/{-y}.'
  }),
});

// Setup tilegrid for wmts layer
var projection = ol.proj.get('EPSG:3857');
var projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(14);
var matrixIds = new Array(14);
for (var z = 0; z < 14; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}

var wmsLayer = new ol.layer.Tile({
  extent: [-13884991, 2870341, -7455066, 6338219],
  source: new ol.source.TileWMS({
    url: 'http://demo.boundlessgeo.com/geoserver/wms',
    params: {'LAYERS': 'topp:states', 'TILED': true},
    serverType: 'geoserver'
  }),
});

var wmtsLayer = new ol.layer.Tile({
  opacity: 0.7,
  source: new ol.source.WMTS({
    attributions: '' +
        'Tiles © <a href="http://services.arcgisonline.com/arcgis/rest/' +
        'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</a>',
    url: 'http://services.arcgisonline.com/arcgis/rest/' +
        'services/Demographics/USA_Population_Density/MapServer/WMTS/',
    layer: '0',
    matrixSet: 'EPSG:3857',
    format: 'image/png',
    projection: projection,
    tileGrid: new ol.tilegrid.WMTS({
      origin: ol.extent.getTopLeft(projectionExtent),
      resolutions: resolutions,
      matrixIds: matrixIds
    }),
    style: 'default',
    wrapX: true
  }),
});

var xyzLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
  }),
  opacity: 1,
});

var togglableLayers = [tileJSONLayer, tmsLayer, wmsLayer, wmtsLayer, xyzLayer];

var map = new ol.Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: olgm.interaction.defaults(),
  layers: [
    googleLayer,
    osmLayer
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

function toggleLayer(index, value) {
  if (value) {
    map.addLayer(togglableLayers[index]);
  } else {
    map.removeLayer(togglableLayers[index]);
  }
}
