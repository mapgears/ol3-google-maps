import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import ImageLayer from 'ol/layer/Image.js';
import OSMSource from 'ol/source/OSM.js';
import ImageWMSSource from 'ol/source/ImageWMS.js';
import TileWMSSource from 'ol/source/TileWMS.js';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';
import GoogleLayer from 'olgm/layer/Google.js';
import {defaults as defaultInteractions} from 'olgm/interaction.js';

const center = [-10997148, 4569099];

const googleLayer = new GoogleLayer();

const osmLayer = new TileLayer({
  source: new OSMSource(),
  visible: false
});

const tileWMSLayer = new TileLayer({
  extent: [-13884991, 2870341, -7455066, 6338219],
  source: new TileWMSSource({
    url: 'http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en',
    params: {'LAYERS': 'limits', 'TILED': true},
    serverType: 'geoserver'
  }),
  visible: true
});

const tileWMSLayer2 = new TileLayer({
  extent: [-13884991, 2870341, -7455066, 6338219],
  source: new TileWMSSource({
    url: 'http://demo.boundlessgeo.com/geoserver/wms',
    params: {'LAYERS': 'topp:states', 'TILED': true},
    serverType: 'geoserver'
  }),
  visible: true
});

const imageWMSLayer = new ImageLayer({
  extent: [-13884991, 2870341, -7455066, 6338219],
  source: new ImageWMSSource({
    url: 'http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en',
    params: {'LAYERS': 'limits', 'TILED': true},
    serverType: 'geoserver'
  }),
  visible: false
});

const imageWMSLayer2 = new ImageLayer({
  extent: [-13884991, 2870341, -7455066, 6338219],
  source: new ImageWMSSource({
    url: 'http://demo.boundlessgeo.com/geoserver/wms',
    params: {'LAYERS': 'topp:states', 'TILED': true},
    serverType: 'geoserver'
  }),
  visible: false
});

const map = new Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: defaultInteractions(),
  layers: [
    googleLayer,
    osmLayer,
    tileWMSLayer,
    tileWMSLayer2,
    imageWMSLayer,
    imageWMSLayer2
  ],
  target: 'map',
  view: new View({
    center: center,
    zoom: 4
  })
});

const olGM = new OLGoogleMaps({map: map}); // map is the Map instance
olGM.activate();

document.getElementById('toggleOSM').addEventListener('click', function() {
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
});

document.getElementById('toggleWMS').addEventListener('click', function() {
  tileWMSLayer.setVisible(!tileWMSLayer.getVisible());
  tileWMSLayer2.setVisible(!tileWMSLayer2.getVisible());
  imageWMSLayer.setVisible(!imageWMSLayer.getVisible());
  imageWMSLayer2.setVisible(!imageWMSLayer2.getVisible());
  const spanText = tileWMSLayer.getVisible() ? 'tiled' : 'image';
  document.getElementById('currentMode').innerHTML = spanText;
});

document.getElementById('setRandomParam').addEventListener('click', function() {
  const params = {
    'random': Math.random()
  };
  tileWMSLayer.getSource().updateParams(params);
  tileWMSLayer2.getSource().updateParams(params);
  imageWMSLayer.getSource().updateParams(params);
  imageWMSLayer2.getSource().updateParams(params);
});
