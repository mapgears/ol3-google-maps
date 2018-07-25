import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSMSource from 'ol/source/OSM.js';
import XYZSource from 'ol/source/XYZ.js';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';
import GoogleLayer from 'olgm/layer/Google.js';
import {defaults as defaultInteractions} from 'olgm/interaction.js';


const center = [-10997148, 4569099];

const googleLayer = new GoogleLayer();

const osmLayer = new TileLayer({
  source: new OSMSource(),
  visible: false
});

const xyzLayer = new TileLayer({
  source: new XYZSource({
    url: 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
  }),
  opacity: 0.5
});

const map = new Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: defaultInteractions(),
  layers: [
    googleLayer,
    osmLayer,
    xyzLayer
  ],
  target: 'map',
  view: new View({
    center: center,
    zoom: 4
  })
});

const olGM = new OLGoogleMaps({map: map}); // map is the Map instance
olGM.activate();

document.getElementById('toggle').addEventListener('click', function() {
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
});
