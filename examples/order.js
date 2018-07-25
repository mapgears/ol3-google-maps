import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import ImageLayer from 'ol/layer/Image.js';
import OSMSource from 'ol/source/OSM.js';
import WMTSSource from 'ol/source/WMTS.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import {get as getProjection} from 'ol/proj.js';
import {getWidth as getExtentWidth, getTopLeft as getExtentTopLeft} from 'ol/extent.js';
import ImageWMSSource from 'ol/source/ImageWMS.js';
import TileWMSSource from 'ol/source/TileWMS.js';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';
import GoogleLayer from 'olgm/layer/Google.js';
import {defaults as defaultInteractions} from 'olgm/interaction.js';


const center = [-10997148, 6569099];

const googleLayer = new GoogleLayer();
googleLayer.name = 'Google layer - Base layer';
googleLayer.color = 'rgb(163, 204, 255)';

const osmLayer = new TileLayer({
  source: new OSMSource(),
  visible: false
});
osmLayer.name = 'OSM layer - Base layer';
osmLayer.color = 'rgb(241, 238, 232)';

const tileWMSLayer = new TileLayer({
  source: new TileWMSSource({
    url: 'http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en',
    params: {'LAYERS': 'limits', 'TILED': true},
    serverType: 'geoserver'
  }),
  visible: true
});
tileWMSLayer.name = 'Tile WMS - Canadian provinces';
tileWMSLayer.color = 'rgb(255, 251, 200)';

const imageWMSLayer = new ImageLayer({
  source: new ImageWMSSource({
    url: 'http://demo.boundlessgeo.com/geoserver/wms',
    params: {'LAYERS': 'topp:states', 'TILED': true},
    serverType: 'geoserver'
  }),
  visible: true
});
imageWMSLayer.name = 'Image WMS - Red/Green/Blue USA';
imageWMSLayer.color = 'rgb(126, 241, 109)';

const imageWMSLayer2 = new ImageLayer({
  extent: [-16884991, 2870341, -3455066, 12338219],
  source: new ImageWMSSource({
    url: 'http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en',
    params: {'LAYERS': 'boundaries'}
  }),
  visible: true
});
imageWMSLayer2.name = 'Image WMS - Canadian boundaries';
imageWMSLayer2.color = '#aaaaaa';

// Setup tilegrid for wmts layer
const projection = getProjection('EPSG:3857');
const projectionExtent = projection.getExtent();
const size = getExtentWidth(projectionExtent) / 256;
const resolutions = new Array(14);
const matrixIds = new Array(14);
for (let z = 0; z < 14; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}

const wmtsLayer = new TileLayer({
  opacity: 0.7,
  source: new WMTSSource({
    attributions: '' +
        'Tiles © <a href="http://services.arcgisonline.com/arcgis/rest/' +
        'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</a>',
    url: 'http://services.arcgisonline.com/arcgis/rest/' +
        'services/Demographics/USA_Population_Density/MapServer/WMTS/',
    layer: '0',
    matrixSet: 'EPSG:3857',
    format: 'image/png',
    projection: projection,
    tileGrid: new WMTSTileGrid({
      origin: getExtentTopLeft(projectionExtent),
      resolutions: resolutions,
      matrixIds: matrixIds
    }),
    style: 'default',
    wrapX: true
  })
});
wmtsLayer.name = 'Tile WMTS - Orange USA';
wmtsLayer.color = 'rgb(241, 207, 185)';

const map = new Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: defaultInteractions(),
  layers: [
    googleLayer,
    osmLayer,
    imageWMSLayer,
    imageWMSLayer2,
    tileWMSLayer,
    wmtsLayer
  ],
  target: 'map',
  view: new View({
    center: center,
    zoom: 4
  })
});

const olGM = new OLGoogleMaps({map: map}); // map is the Map instance
olGM.activate();
createLayerTree();

function createLayerTree() {
  const layerTreeElement = document.getElementById('layerTree');
  layerTreeElement.innerHTML = '';
  const layers = map.getLayers();

  for (let i = layers.getLength() - 1; i >= 0; i--) {
    const layer = layers.getArray()[i];

    const item = document.createElement('div');
    item.style.backgroundColor = layer.color;
    const moreText = layer.getVisible() ? '' : '(invisible) ';
    const itemText = document.createTextNode(moreText + layer.name);

    item.appendChild(itemText);

    if (i != layers.getLength() - 1) {
      const upButton = document.createElement('button');
      upButton.className = 'up';
      upButton.onclick = moveUp.bind(upButton, layer);
      const upButtonText = document.createTextNode('\u25B2');
      upButton.appendChild(upButtonText);
      item.appendChild(upButton);
    }

    if (i != 0) {
      const downButton = document.createElement('button');
      downButton.className = 'down';
      downButton.onclick = moveDown.bind(downButton, layer);
      const downButtonText = document.createTextNode('\u25BC');
      downButton.appendChild(downButtonText);
      item.appendChild(downButton);
    }

    layerTreeElement.appendChild(item);
  }
}

function moveUp(layer) {
  const layers = map.getLayers();
  const index = layers.getArray().indexOf(layer);

  layers.removeAt(index);
  layers.insertAt(index + 1, layer);

  createLayerTree();
}

function moveDown(layer) {
  const layers = map.getLayers();
  const index = layers.getArray().indexOf(layer);

  layers.removeAt(index);
  layers.insertAt(index - 1, layer);

  createLayerTree();
}


document.getElementById('toggle').addEventListener('click', function() {
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
});
