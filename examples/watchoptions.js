import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import ImageLayer from 'ol/layer/Image.js';
import OSMSource from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';
import ImageWMSSource from 'ol/source/ImageWMS.js';
import TileWMSSource from 'ol/source/TileWMS.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import Style from 'ol/style/Style.js';
import Icon from 'ol/style/Icon.js';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';
import GoogleLayer from 'olgm/layer/Google.js';
import {defaults as defaultInteractions} from 'olgm/interaction.js';


const center = [-10997148, 4569099];

const googleLayer = new GoogleLayer();

const osmLayer = new TileLayer({
  source: new OSMSource(),
  visible: false
});

const imageWMSLayer = new ImageLayer({
  source: new ImageWMSSource({
    url: 'http://demo.boundlessgeo.com/geoserver/wms',
    params: {'LAYERS': 'topp:states', 'TILED': true},
    serverType: 'geoserver'
  })
});

const tileWMSLayer = new TileLayer({
  source: new TileWMSSource({
    url: 'http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en',
    params: {'LAYERS': 'limits', 'TILED': true},
    serverType: 'geoserver'
  })
});

const source = new VectorSource();

const watchOptions = {
  'image': false,
  'tile': false,
  'vector': false
};

// Add some randomly generated markers
const markers = [];

for (let i = 0; i < 10; i++) {
  const x = Math.floor((Math.random() * 1000000) - 10997148);
  const y = Math.floor((Math.random() * 1000000) + 4569099);
  const marker = new Feature(new Point([x, y]));
  marker.setStyle(new Style({
    image: new Icon(/** @type {olx.style.IconOptions} */ ({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: 'data/icon.png'
    })),
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
    osmLayer,
    tileWMSLayer,
    imageWMSLayer,
    googleLayer,
    vector
  ],
  target: 'map',
  view: new View({
    center: center,
    zoom: 4
  })
});

const olGM = new OLGoogleMaps({
  map: map,
  watch: watchOptions
}); // map is the Map instance
olGM.activate();


document.getElementById('toggleOSM').addEventListener('click', function() {
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
});

document.getElementById('toggleWatch').addEventListener('click', function(event) {
  if (event.target.matches('input')) {
    const option = event.target.value;
    watchOptions[option] = !watchOptions[option];
    olGM.setWatchOptions(watchOptions);
  }
});
