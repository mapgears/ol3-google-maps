import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSMSource from 'ol/source/OSM.js';
import 'ol-layerswitcher/src/ol-layerswitcher.css';
import LayerSwitcher from 'ol-layerswitcher';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';
import GoogleLayer from 'olgm/layer/Google.js';
import {defaults as defaultInteractions} from 'olgm/interaction.js';

const center = [-7908084, 6177492];

// This dummy layer tells Google Maps to switch to its default map type
const googleLayer = new GoogleLayer({
  title: 'Google',
  type: 'base'
});

const osmLayer = new TileLayer({
  source: new OSMSource(),
  title: 'OSM',
  type: 'base'
});


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
    zoom: 12
  })
});

const olGM = new OLGoogleMaps({map: map}); // map is the Map instance
olGM.activate();

const layerSwitcher = new LayerSwitcher();
map.addControl(layerSwitcher);
