import Map from 'ol/Map.js';
import View from 'ol/View.js';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';
import GoogleLayer from 'olgm/layer/Google.js';
import {defaults as defaultInteractions} from 'olgm/interaction.js';


const center = [-7908084, 6177492];

const regularLayer = new GoogleLayer({
  visible: false
});

const themedLayer = new GoogleLayer({
  styles: [{
    'stylers': [{
      'saturation': -100
    }, {
      'gamma': 2.25
    }]
  }]
});

const map = new Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: defaultInteractions(),
  layers: [
    regularLayer,
    themedLayer
  ],
  target: 'map',
  view: new View({
    center: center,
    zoom: 12
  })
});

const olGM = new OLGoogleMaps({map: map}); // map is the Map instance
olGM.activate();

document.getElementById('toggle').addEventListener('click', function() {
  regularLayer.setVisible(!regularLayer.getVisible());
  themedLayer.setVisible(!themedLayer.getVisible());
});
