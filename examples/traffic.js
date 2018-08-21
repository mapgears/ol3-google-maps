import Map from 'ol/Map.js';
import View from 'ol/View.js';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';
import GoogleLayer from 'olgm/layer/Google.js';
import {defaults as defaultInteractions} from 'olgm/interaction.js';


const center = [-7908084, 6177492];

// This dummy layer tells Google Maps to switch to its default map type
const googleLayer = new GoogleLayer();

const map = new Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: defaultInteractions(),
  layers: [
    googleLayer
  ],
  target: 'map',
  view: new View({
    center: center,
    zoom: 12
  })
});

const olGM = new OLGoogleMaps({map: map}); // map is the Map instance
olGM.activate();

const gmap = olGM.getGoogleMapsMap();

const trafficLayer = new google.maps.TrafficLayer();
trafficLayer.setMap(gmap);
