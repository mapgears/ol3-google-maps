import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import ImageLayer from 'ol/layer/Image.js';
import OSMSource from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';
import TileJSONSource from 'ol/source/TileJSON.js';
import ImageWMSSource from 'ol/source/ImageWMS.js';
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

const tileJSONLayer = new TileLayer({
  source: new TileJSONSource({
    url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.json',
    crossOrigin: 'anonymous'
  }),
  minResolution: 4000,
  maxResolution: 10000
});

const imageWMSLayer = new ImageLayer({
  extent: [-13884991, 2870341, -7455066, 6338219],
  source: new ImageWMSSource({
    url: 'http://demo.boundlessgeo.com/geoserver/wms',
    params: {'LAYERS': 'topp:states', 'TILED': true},
    serverType: 'geoserver'
  }),
  minResolution: 4000,
  maxResolution: 10000
});

const vectorSource = new VectorSource();
const markers = [];

for (let i = 0; i < 50; i++) {
  const x = Math.floor((Math.random() * -18000000));
  const y = Math.floor((Math.random() * 10000000));
  const marker = new Feature(new Point([x, y]));
  marker.setStyle(new Style({
    image: new Icon(/** @type {olx.style.IconOptions} */ ({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: 'data/icon.png'
    }))
  })
  );
  markers.push(marker);
}

vectorSource.addFeatures(markers);
const vectorLayer = new VectorLayer({
  source: vectorSource,
  minResolution: 4000,
  maxResolution: 10000
});

const map = new Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: defaultInteractions(),
  layers: [
    googleLayer,
    osmLayer,
    tileJSONLayer,
    imageWMSLayer,
    vectorLayer
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
