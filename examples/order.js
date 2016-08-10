var center = [-10997148, 6569099];

var googleLayer = new olgm.layer.Google();
googleLayer.name = 'Google layer - Base layer';
googleLayer.color = 'rgb(163, 204, 255)'

var osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: false
});
osmLayer.name = 'OSM layer - Base layer';
osmLayer.color = 'rgb(241, 238, 232)';

var tileWMSLayer  =  new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: 'http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en',
    params: {'LAYERS': 'limits', 'TILED': true},
    serverType: 'geoserver'
  }),
  visible: true,
});
tileWMSLayer.name = 'Tile WMS - Canadian provinces';
tileWMSLayer.color = 'rgb(255, 251, 200)';

var imageWMSLayer = new ol.layer.Image({
  source: new ol.source.ImageWMS({
    url: 'http://demo.boundlessgeo.com/geoserver/wms',
    params: {'LAYERS': 'topp:states', 'TILED': true},
    serverType: 'geoserver'
  }),
  visible: true,
});
imageWMSLayer.name = 'Image WMS - Red/Green/Blue USA';
imageWMSLayer.color = 'rgb(126, 241, 109)';

var imageWMSLayer2  =  new ol.layer.Image({
  extent: [-16884991, 2870341, -3455066, 12338219],
  source: new ol.source.ImageWMS({
    url: 'http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en',
    params: {'LAYERS': 'boundaries'}
  }),
  visible: true,
});
imageWMSLayer2.name = 'Image WMS - Canadian boundaries';
imageWMSLayer2.color = '#aaaaaa';

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
wmtsLayer.name = 'Tile WMTS - Orange USA'
wmtsLayer.color = 'rgb(241, 207, 185)';

var map = new ol.Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: olgm.interaction.defaults(),
  layers: [
    googleLayer,
    osmLayer,
    imageWMSLayer,
    imageWMSLayer2,
    tileWMSLayer,
    wmtsLayer
  ],
  target: 'map',
  view: new ol.View({
    center: center,
    zoom: 4
  })
});

var olGM = new olgm.OLGoogleMaps({map: map}); // map is the ol.Map instance
olGM.activate();
createLayerTree();

function createLayerTree() {
  var layerTreeElement = document.getElementById('layerTree');
  layerTreeElement.innerHTML = '';
  var layers = map.getLayers();

  for (var i = layers.getLength() - 1; i >= 0; i--) {
    var layer = layers.getArray()[i];

    var item = document.createElement('div');
    item.style.backgroundColor = layer.color;
    var moreText = layer.getVisible() ? '' : '(invisible) ';
    var itemText = document.createTextNode(moreText + layer.name);

    item.appendChild(itemText);

    if (i != layers.getLength() - 1) {
      var upButton = document.createElement('button');
      upButton.className = 'up';
      upButton.onclick = moveUp.bind(upButton, layer)
      var upButtonText = document.createTextNode('\u25B2');
      upButton.appendChild(upButtonText);
      item.appendChild(upButton);
    }

    if (i != 0) {
      var downButton = document.createElement('button');
      downButton.className = 'down';
      downButton.onclick = moveDown.bind(downButton, layer);
      var downButtonText = document.createTextNode('\u25BC');
      downButton.appendChild(downButtonText);
      item.appendChild(downButton);
    }

    layerTreeElement.appendChild(item);
  }
}

function moveUp(layer) {
  var layers = map.getLayers();
  var index = layers.getArray().indexOf(layer);

  layers.removeAt(index);
  layers.insertAt(index + 1, layer);

  createLayerTree();
}

function moveDown(layer) {
  var layers = map.getLayers();
  var index = layers.getArray().indexOf(layer);

  layers.removeAt(index);
  layers.insertAt(index - 1, layer);

  createLayerTree();
}



function toggle() {
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
  createLayerTree();
};
