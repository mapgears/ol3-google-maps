import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import OSMSource from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import Style from 'ol/style/Style.js';
import Icon from 'ol/style/Icon.js';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';
import GoogleLayer from 'olgm/layer/Google.js';
import {defaults as defaultInteractions} from 'olgm/interaction.js';

const center = [-7908084, 6177492];
const left = [-7928084, 6177492];

const googleLayer = new GoogleLayer();

const osmLayer = new TileLayer({
  source: new OSMSource(),
  visible: false
});

const source = new VectorSource();
const feature = new Feature(new Point(center));
feature.setStyle(new Style({
  image: new Icon(({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    size: [32, 48],
    scale: 0.75,
    src: 'data/icon.png',
    rotation: 0.25 * Math.PI,
    opacity: 0.5
  }))
}));
source.addFeature(feature);

const bigIcon = new Feature(new Point(left));
bigIcon.setStyle(new Style({
  image: new Icon(({
    anchor: [132, 468],
    anchorXUnits: 'pixels',
    anchorYUnits: 'pixels',
    src: 'data/linux.png',
    opacity: 0.5
  }))
}));

source.addFeature(bigIcon);

setInterval(function() {
  const image = bigIcon.getStyle().getImage();
  image.setRotation(image.getRotation() + Math.PI / 180.0);
  bigIcon.changed();
}, 30);

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
  }}); // map is the ol.Map instance
olGM.activate();


document.getElementById('toggle').addEventListener('click', function() {
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
});
