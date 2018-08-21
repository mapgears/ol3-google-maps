import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import OSMSource from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import {fromExtent} from 'ol/geom/Polygon.js';
import Style from 'ol/style/Style.js';
import Icon from 'ol/style/Icon.js';
import Stroke from 'ol/style/Stroke.js';
import Fill from 'ol/style/Fill.js';
import Circle from 'ol/style/Circle.js';
import Text from 'ol/style/Text.js';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';
import GoogleLayer from 'olgm/layer/Google.js';
import {defaults as defaultInteractions} from 'olgm/interaction.js';

const center = [-7908084, 6177492];

const googleLayer = new GoogleLayer();

const osmLayer = new TileLayer({
  source: new OSMSource(),
  visible: false
});

const source = new VectorSource();
const feature = new Feature(new Point(center));
feature.setStyle(new Style({
  image: new Circle({
    'fill': new Fill({color: 'rgba(153,51,51,1)'}),
    'stroke': new Stroke({color: 'rgb(30,30,30)', width: 2}),
    'radius': 20
  }),
  text: new Text({
    font: 'normal 12pt Arial',
    text: '930',
    fill: new Fill({color: 'black'}),
    stroke: new Stroke({color: 'white', width: 3})
  })
}));

const feature2 = new Feature(new Point([-7907700, 6176600]));
feature2.setStyle(new Style({
  image: new Circle({
    'fill': new Fill({color: 'rgba(51,153,51,1)'}),
    'stroke': new Stroke({color: 'rgb(30,30,30)', width: 2}),
    'radius': 20
  }),
  text: new Text({
    font: 'normal 18pt Arial',
    text: 'Hi',
    fill: new Fill({color: 'black'}),
    stroke: new Stroke({color: 'white', width: 3})
  })
}));

const feature3 = new Feature(fromExtent(
  [-7920319, 6176097, -7914143, 6179053]));

feature3.setStyle(new Style({
  fill: new Fill({color: 'rgba(51,153,51,1)'}),
  stroke: new Stroke({color: 'rgb(30,30,30)', width: 2}),
  text: new Text({
    textAlign: 'left',
    textBaseline: 'bottom',
    font: 'normal 11pt Arial',
    text: 'Bottom-Left',
    fill: new Fill({color: 'white'})
  })
}));

const marker = new Feature(new Point([-7912700, 6176500]));
marker.setStyle(new Style({
  image: new Icon(/** @type {olx.style.IconOptions} */ ({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'data/icon.png'
  })),
  text: new Text({
    offsetX: 0,
    offsetY: -32,
    font: 'normal 20pt Courrier',
    text: 'X',
    fill: new Fill({color: 'black'}),
    stroke: new Stroke({color: 'white', width: 4})
  })
}));

source.addFeatures([feature, feature2, feature3, marker]);

// Add some randomly generated markers

const markers = [];
const letters = 'abcdefghijklmnopqrstuvwxyz';

for (let i = 0; i < 10; i++) {
  const x = Math.floor((Math.random() * 10000) - 7912700);
  const y = Math.floor((Math.random() * 10000) + 6171500);
  const marker = new Feature(new Point([x, y]));
  marker.setStyle(new Style({
    image: new Icon(/** @type {olx.style.IconOptions} */ ({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: 'data/icon.png'
    })),
    text: new Text({
      offsetX: 0,
      offsetY: -32,
      font: 'normal 14pt Courrier',
      text: letters.charAt(i) + letters.charAt(i + 1),
      fill: new Fill({color: 'black'}),
      stroke: new Stroke({color: '#aaffaa', width: 6})
    }),
    zIndex: i
  })
  );
  markers.push(marker);
}

source.addFeatures(markers);

const vector = new VectorLayer({
  source: source
});

const map = new Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: defaultInteractions(),
  layers: [
    googleLayer,
    osmLayer,
    vector
  ],
  target: 'map',
  view: new View({
    center: center,
    zoom: 12
  })
});

const olGM = new OLGoogleMaps({
  map: map,
  mapIconOptions: {
    useCanvas: true
  }
}); // map is the Map instance
olGM.activate();


document.getElementById('toggle').addEventListener('click', function() {
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
});
