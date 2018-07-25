import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSMSource from 'ol/source/OSM.js';
import OverviewMap from 'ol/control/OverviewMap.js';
import {defaults as defaultControls} from 'ol/control.js';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';
import GoogleLayer from 'olgm/layer/Google.js';
import {defaults as defaultInteractions} from 'olgm/interaction.js';


const center = [-7908084, 6177492];

const googleLayer = new GoogleLayer();

const osmLayer = new TileLayer({
  source: new OSMSource(),
  visible: false
});

// Create the overview map control
const overviewMapControl = new OverviewMap({
  className: 'ol-overviewmap ol-custom-overviewmap',
  collapsed: false
});

const map = new Map({
  controls: defaultControls().extend([
    overviewMapControl
  ]),
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

const olGM = new OLGoogleMaps({
  map: map
});

// Get the map in the overview box
const overviewMap = overviewMapControl.getOverviewMap();

// Setup an instance of olGM for the overview
const overviewOLGM = new OLGoogleMaps({
  map: overviewMap
});

// Activate it
overviewOLGM.activate();

// Activate the main map only when google maps is done loading in the overview.
google.maps.event.addListenerOnce(overviewOLGM.gmap, 'idle', function() {
  olGM.activate();
});

document.getElementById('toggle').addEventListener('click', function() {
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
});
