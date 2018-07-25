import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSMSource from 'ol/source/OSM.js';
import TileJSONSource from 'ol/source/TileJSON.js';
import TileWMSSource from 'ol/source/TileWMS.js';
import WMTSSource from 'ol/source/WMTS.js';
import XYZSource from 'ol/source/XYZ.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import {get as getProjection} from 'ol/proj.js';
import {getWidth as getExtentWidth, getTopLeft as getExtentTopLeft} from 'ol/extent.js';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';
import GoogleLayer from 'olgm/layer/Google.js';
import {defaults as defaultInteractions} from 'olgm/interaction.js';

const center = [-10997148, 4569099];

const googleLayer = new GoogleLayer();

const osmLayer = new TileLayer({
  source: new OSMSource(),
  visible: false
});

const tileJSONLayer = new TileLayer({
  source: new TileJSONSource({
    url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.json',
    crossOrigin: 'anonymous'
  }),
  opacity: 0.5
});

const tmsLayer = new TileLayer({
  source: new XYZSource({
    url: 'http://v3.cartalib.mapgears.com/mapcache/tms/' +
        '1.0.0/mapgears_basemap@g/{z}/{x}/{-y}.'
  })
});

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

const wmsLayer = new TileLayer({
  extent: [-13884991, 2870341, -7455066, 6338219],
  source: new TileWMSSource({
    url: 'http://demo.boundlessgeo.com/geoserver/wms',
    params: {'LAYERS': 'topp:states', 'TILED': true},
    serverType: 'geoserver'
  })
});

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

const xyzLayer = new TileLayer({
  source: new XYZSource({
    url: 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
  }),
  opacity: 1
});

const togglableLayers = {
  TileJSON: tileJSONLayer,
  TMS: tmsLayer,
  WMS: wmsLayer,
  WMTS: wmtsLayer,
  XYZ: xyzLayer
};

const map = new Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: defaultInteractions(),
  layers: [
    googleLayer,
    osmLayer
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

document.getElementById('toggleLayers').addEventListener('click', function(event) {
  if (event.target.matches('input')) {
    const layer = togglableLayers[event.target.value];
    if (event.target.checked) {
      map.addLayer(layer);
    } else {
      map.removeLayer(layer);
    }
  }
});

document.getElementById('opacity').addEventListener('input', function(event) {
  const value = event.target.value / 100;
  const valueElement = document.getElementById('opacityValue');
  valueElement.innerHTML = value;

  tileJSONLayer.setOpacity(value);
  tmsLayer.setOpacity(value);
  wmsLayer.setOpacity(value);
  wmtsLayer.setOpacity(value);
  xyzLayer.setOpacity(value);
});
