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
import Circle from 'ol/style/Circle.js';
import ZoomSlider from 'ol/control/ZoomSlider.js';
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

const source = new VectorSource();
const feature = new Feature(new Point(center));
feature.setStyle(new Style({
  image: new Circle({
    'fill': new Fill({color: 'rgba(153,51,51,0.3)'}),
    'stroke': new Stroke({color: 'rgb(153,51,51)', width: 2}),
    'radius': 20
  })
}));
source.addFeature(feature);
const vector = new VectorLayer({
  source: source
});

const map = new Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: defaultInteractions(),
  controls: defaultControls().extend([
    new ZoomSlider()
  ]),
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

const olGM = new OLGoogleMaps({map: map}); // map is the Map instance
olGM.activate();


document.getElementById('toggle').addEventListener('click', function() {
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
});
