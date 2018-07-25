import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import OSMSource from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import Style from 'ol/style/Style.js';
import Stroke from 'ol/style/Stroke.js';
import Fill from 'ol/style/Fill.js';
import RegularShape from 'ol/style/RegularShape.js';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';
import GoogleLayer from 'olgm/layer/Google.js';
import {defaults as defaultInteractions} from 'olgm/interaction.js';


const center = [-7908084, 6177492];

// This dummy layer tells Google Maps to switch to its default map type
const googleLayer = new GoogleLayer();

const osmLayer = new TileLayer({
  source: new OSMSource(),
  visible: false
});

const stroke = new Stroke({color: 'black', width: 2});

const styles = {
  'square': [new Style({
    image: new RegularShape({
      fill: new Fill({color: 'red'}),
      stroke: stroke,
      points: 4,
      radius: 10,
      angle: Math.PI / 4
    })
  })],
  'triangle': [new Style({
    image: new RegularShape({
      fill: new Fill({color: 'yellow'}),
      stroke: stroke,
      points: 3,
      radius: 10,
      rotation: Math.PI / 4,
      angle: 0
    })
  })],
  'star': [new Style({
    image: new RegularShape({
      fill: new Fill({color: 'green'}),
      stroke: stroke,
      points: 5,
      radius: 10,
      radius2: 4,
      angle: 0
    })
  })],
  'pentagon': [new Style({
    image: new RegularShape({
      fill: new Fill({color: 'blue'}),
      stroke: stroke,
      points: 5,
      radius: 10,
      angle: 0
    })
  })],
  'x': [new Style({
    image: new RegularShape({
      stroke: stroke,
      points: 4,
      radius: 10,
      radius2: 0,
      angle: Math.PI / 4
    })
  })]
};


const styleKeys = ['x', 'pentagon', 'star', 'triangle', 'square'];
const count = 50;
const features = new Array(count);
const spread = 20000;
for (let i = 0; i < count; ++i) {
  const x = center[0] - (spread / 2) + Math.random() * spread;
  const y = center[1] - (spread / 2) + Math.random() * spread;
  const coordinates = [x, y];
  features[i] = new Feature(new Point(coordinates));
  const style = styles[styleKeys[Math.floor(Math.random() * 5)]][0];
  features[i].setStyle(style);
}

const source = new VectorSource({
  features: features
});

const vectorLayer = new VectorLayer({
  source: source
});

const map = new Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: defaultInteractions(),
  layers: [
    googleLayer,
    osmLayer,
    vectorLayer
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
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
});
