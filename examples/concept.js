import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import OSMSource from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import MultiPoint from 'ol/geom/MultiPoint.js';
import LineString from 'ol/geom/LineString.js';
import MultiLineString from 'ol/geom/MultiLineString.js';
import Polygon, {fromExtent} from 'ol/geom/Polygon.js';
import MultiPolygon from 'ol/geom/MultiPolygon.js';
import Style from 'ol/style/Style.js';
import Icon from 'ol/style/Icon.js';
import Stroke from 'ol/style/Stroke.js';
import Fill from 'ol/style/Fill.js';
import Circle from 'ol/style/Circle.js';
import Text from 'ol/style/Text.js';
import PointerInteraction from 'ol/interaction/Pointer.js';
import SelectInteraction from 'ol/interaction/Select.js';
import {transform} from 'ol/proj.js';
import {never} from 'ol/events/condition.js';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';
import GoogleLayer from 'olgm/layer/Google.js';
import {defaults as defaultInteractions} from 'olgm/interaction.js';


class Drag extends PointerInteraction {
  constructor() {
    super({
      handleDownEvent: handleDownEvent,
      handleDragEvent: handleDragEvent,
      handleMoveEvent: handleMoveEvent,
      handleUpEvent: handleUpEvent
    });

    /**
     * @type {ol.Pixel}
     * @private
     */
    this.coordinate_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.cursor_ = 'pointer';

    /**
     * @type {ol.Feature}
     * @private
     */
    this.feature_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.previousCursor_ = undefined;

  }
}


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
function handleDownEvent(evt) {
  const map = evt.map;

  const features = map.getFeaturesAtPixel(evt.pixel);

  if (features && features.length > 0) {
    this.coordinate_ = evt.coordinate;
    this.feature_ = features[0];
  }

  return features && features.length > 0;
}


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
function handleDragEvent(evt) {
  const map = evt.map;

  const deltaX = evt.coordinate[0] - this.coordinate_[0];
  const deltaY = evt.coordinate[1] - this.coordinate_[1];

  const geometry = /** @type {ol.geom.SimpleGeometry} */
      (this.feature_.getGeometry());
  geometry.translate(deltaX, deltaY);

  this.coordinate_[0] = evt.coordinate[0];
  this.coordinate_[1] = evt.coordinate[1];
}


/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
function handleMoveEvent(evt) {
  if (this.cursor_) {
    const map = evt.map;
    const features = map.getFeaturesAtPixel(evt.pixel);
    const element = evt.map.getTargetElement();
    if (features) {
      const style = features[0].getStyle();
      if (style) {
        const image = style.getImage();
        if (image && image.getSrc) {
          if (image.getSrc() == 'data/icon.png') {
            features[0].setStyle(
              new Style({
                image: new Icon({
                  anchor: [0.5, 46],
                  anchorXUnits: 'fraction',
                  anchorYUnits: 'pixels',
                  opacity: 0.75,
                  src: 'data/icon.png'
                })
              })
            );
          }
        }
      }

      if (element.style.cursor != this.cursor_) {
        this.previousCursor_ = element.style.cursor;
        element.style.cursor = this.cursor_;
      }
    } else if (this.previousCursor_ !== undefined) {
      element.style.cursor = this.previousCursor_;
      this.previousCursor_ = undefined;
    }
  }
}


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
function handleUpEvent() {
  this.coordinate_ = null;
  this.feature_ = null;
  return false;
}


const lat = 50;
const lng = -70;
const zoom = 5;
//var extent = [-83, 44, -57, 55];
// const extent = [-9259955, 5467881, -6324773, 7424669];

const osmLayer = new TileLayer({
  source: new OSMSource(),
  visible: false
});

const map = new Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: defaultInteractions().extend([
    new Drag()
  ]),
  layers: [
    osmLayer,
    new GoogleLayer()
  ],
  target: 'map',
  view: new View({
    center: transform([lng, lat], 'EPSG:4326', 'EPSG:3857'),
    zoom: zoom
  })
});

// FIXME - style override, this should be managed internally
/*
gmap.data.setStyle({
  icon: 'resources/evouala.png'
});
*/


const vector = new VectorLayer({
  source: new VectorSource()
});
map.addLayer(vector);

const generateCoordinate = function() {
  const extent = [-9259955, 5467881, -6324773, 7424669];
  const deltaX = extent[2] - extent[0];
  const deltaY = extent[3] - extent[1];
  return [
    extent[0] + (deltaX * Math.random()),
    extent[1] + (deltaY * Math.random())
  ];
};

const generatePointFeature = function() {
  return new Feature(
    new Point(generateCoordinate())
  );
};

const generateLineFeature = function() {
  const coordinates = [];
  for (let i = 0, len = 3; i < len; i++) {
    coordinates.push(generateCoordinate());
  }
  return new Feature(
    new LineString(coordinates)
  );
};

const addPointFeatures = function(len, opt_style, opt_pane) {
  let feature;
  for (let i = 0; i < len; i++) {
    feature = generatePointFeature();
    if (opt_style) {
      const style = new Style(opt_style);
      style.setZIndex(Math.floor(Math.random() * 1000));
      feature.setStyle(style);
    }
    feature.set('olgm_pane', opt_pane);
    vector.getSource().addFeature(feature);
  }
};

const addMarkerFeatures = function(len, opt_pane) {
  addPointFeatures(len, {
    image: new Icon(/** @type {olx.style.IconOptions} */ ({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 0.75,
      src: 'data/icon.png'
    })),
    text: new Text({
      offsetX: 0,
      offsetY: -32,
      font: 'normal 14pt Courrier',
      text: 'hi',
      fill: new Fill({color: 'black'}),
      stroke: new Stroke({color: '#ffffff', width: 5})
    })
  }, opt_pane);
};

const addCircleFeatures = function(len) {
  addPointFeatures(len, {
    image: new Circle({
      'fill': new Fill({color: 'rgba(153,51,51,0.3)'}),
      'stroke': new Stroke({color: 'rgb(153,51,51)', width: 2}),
      'radius': 20
    })
  });
};

const addLineFeatures = function(len, opt_style) {
  let feature;
  for (let i = 0; i < len; i++) {
    feature = generateLineFeature();
    if (opt_style) {
      feature.setStyle(opt_style);
    }
    vector.getSource().addFeature(feature);
  }
};


addPointFeatures(3);
addPointFeatures(3, {
  image: new Circle({
    'fill': new Fill({color: '#3F5D7D'}),
    'stroke': new Stroke({color: 'rgb(30,30,30)', width: 2}),
    'radius': 20
  }),
  text: new Text({
    font: 'normal 16pt Arial',
    text: '42',
    fill: new Fill({color: 'black'}),
    stroke: new Stroke({color: 'white', width: 3})
  })
});
addMarkerFeatures(3, 'overlayLayer');
addCircleFeatures(3);
addLineFeatures(1);
// line with custom style
addLineFeatures(1, new Style({
  stroke: new Stroke({
    width: 4,
    color: '#CC3333'
  })
}));
// add polygon feature
vector.getSource().addFeature(new Feature(
  new fromExtent([-8259955, 6067881, -7324773, 6524669])
));
// add polygon feature with custom style
const poly2 = new Feature(
  new fromExtent([-8159955, 6167881, -7124773, 6724669])
);
poly2.setStyle(new Style({
  fill: new Stroke({
    color: 'rgba(63,93,125,0.4)'
  }),
  stroke: new Stroke({
    width: 4,
    color: 'rgba(63,93,125,0.8)'
  })
}));
vector.getSource().addFeature(poly2);

//Draw some waves over by St. John's
vector.getSource().addFeature(new Feature(
  new MultiLineString([
    [
      [-5974691, 6487857], [-5949008, 6489080], [-5930052, 6498253], [-5923937, 6514151], [-5923937, 6528216], [-5931275, 6542280], [-5947785, 6552676], [-5938613, 6564294], [-5917211, 6569186], [-5890916, 6564906], [-5870737, 6542280], [-5864622, 6528216], [-5856673, 6508036], [-5849946, 6494584], [-5831601, 6481742], [-5807141, 6481742]
    ],
    [[-5759445, 6590588], [-5733762, 6591811], [-5714806, 6600984], [-5708691, 6616882], [-5708691, 6630947], [-5716029, 6645011], [-5732539, 6655407], [-5723367, 6667025], [-5701965, 6671917], [-5675670, 6667637], [-5655491, 6645011], [-5649376, 6630947], [-5641427, 6610767], [-5634700, 6597315], [-5616355, 6584473], [-5591895, 6584473]
    ],
    [[-5842608, 6345990], [-5816925, 6347213], [-5797969, 6356386], [-5791854, 6372284], [-5791854, 6386349], [-5799192, 6400413], [-5815702, 6410809], [-5806530, 6422427], [-5785128, 6427319], [-5758833, 6423039], [-5738654, 6400413], [-5732539, 6386349], [-5724590, 6366169], [-5717863, 6352717], [-5699518, 6339875], [-5675058, 6339875]
    ],
    [
      [-6189937, 6590588], [-6164254, 6591811], [-6145298, 6600984], [-6139183, 6616882], [-6139183, 6630947], [-6146521, 6645011], [-6163031, 6655407], [-6153859, 6667025], [-6132457, 6671917], [-6106162, 6667637], [-6085983, 6645011], [-6079868, 6630947], [-6071919, 6610767], [-6065192, 6597315], [-6046847, 6584473], [-6022387, 6584473]
    ]
  ])
));

//Add multipoint features (amorphouse polygons over the great lakes)
vector.getSource().addFeature(new Feature(
  new MultiPoint([
    [-9672891.19266937, 5858459.659598391],
    [-9745062.958135372, 5893963.890488241],
    [-9647689.573148679, 5863536.086402805],
    [-9730591.424332244, 5896624.877283241],
    [-9791321.772534516, 5933916.615134273],
    [-9793579.331807803, 5934640.688879042],
    [-9426812.77910139, 5859492.820181577],
    [-9732755.475233268, 5878872.11359686],
    [-9796052.850893231, 5935955.264566257],
    [-9735879.100144926, 5883329.635253923],
    [-9753443.089402288, 6010352.407981171],
    [-9792806.774541698, 5934278.644497848],
    [-9729447.059966892, 5876171.146771175],
    [-9457363.300154697, 5858234.934948056],
    [-9731055.626608854, 5877386.235962508],
    [-9726787.63733184, 5869873.199366087],
    [-9783097.488554709, 6019953.7574658375],
    [-9727283.00906587, 5875092.288529382],
    [-9725272.579062143, 5875540.986740408],
    [-9727932.001697194, 5867176.616743093],
    [-9456096.484349469, 5865962.93906406],
    [-9826357.355871884, 5953780.296783763],
    [-9653533.846415326, 5857919.683425376],
    [-9656038.534958174, 5862366.582685764]
  ])
));

//Add simple multi poly (amorphouse polygons over the great lakes)
vector.getSource().addFeature(new Feature(
  new MultiPolygon([[
    [
      [-9665988, 6059810],
      [-9763828, 6020674],
      [-9763828, 5883699],
      [-9631745, 5859239],
      [-9548581, 5952186],
      [-9548581, 6015782]
    ],
    [
      [-9582825, 6103837],
      [-9533905, 6089162],
      [-9470310, 6138081],
      [-9529013, 6206569],
      [-9582825, 6162541],
      [-9612177, 6133189]
    ],
    [
      [-9411606, 5771184],
      [-9255063, 5653776],
      [-9030032, 5560829],
      [-9078952, 5688020],
      [-8946869, 5658668],
      [-8951761, 5800535],
      [-9083844, 5780967]
    ]
  ]])
));


// Add movable multi-polygon (pinwheel over ontario)
let multiCoords = [];
for (let i = 0; i < 8; i++) {
  const p = new Polygon([[
    [-9670881, 6798497],
    [-9748937, 6989284],
    [-9690449, 7180071],
    [-9612178, 6979500]
  ]]);
  p.rotate(i * Math.PI / 4, [-9770881, 6798497]);
  multiCoords = multiCoords.concat(p.getCoordinates());
}
const poly3 = new Feature(new MultiPolygon([multiCoords]));
const vectorForMultiPoly = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
    fill: new Fill({
      color: [233, 150, 36, 0.1]
    }),
    stroke: new Stroke({
      color: [233, 150, 36, 1],
      width: 1
    })
  })
});
map.addLayer(vectorForMultiPoly);
vectorForMultiPoly.getSource().addFeature(poly3);
const select = new SelectInteraction({
  layers: [vectorForMultiPoly],
  toggleCondition: never,
  condition: function(event) {
    if (event.type == 'click') {
      // console.log(event.coordinate);
    }
    return event.type == 'pointermove';
  },
  style: new Style({
    fill: new Fill({
      color: [255, 23, 180, 0.2]
    }),
    stroke: new Stroke({
      color: [255, 23, 180, 1]
    })
  })
});
map.addInteraction(select);


const olGM = new OLGoogleMaps({
  map: map,
  mapIconOptions: {
    useCanvas: true
  }});
olGM.activate();

document.getElementById('toggle').onclick = function() {
  olGM.toggle();
};

document.getElementById('add-point').onclick = function() {
  addMarkerFeatures(3);
};

document.getElementById('clear-point').onclick = function() {
  vector.getSource().clear();
};


const toggleOsmLayer = function(opt_visible) {
  const visible = opt_visible !== undefined ? opt_visible :
    !osmLayer.getVisible();
  osmLayer.setVisible(visible);
};

document.getElementById('toggle-osm').onclick = function() {
  toggleOsmLayer();
};

document.getElementById('gm-rm-last').onclick = function() {
  let found = null;
  const layers = map.getLayers();

  // remove last one
  layers.getArray().slice(0).reverse().every(function(layer) {
    if (layer instanceof GoogleLayer) {
      found = layer;
      return false;
    }
    return true;
  }, this);
  if (found) {
    layers.remove(found);
  }

};


document.getElementById('gm-add-sat').onclick = function() {
  map.getLayers().push(new GoogleLayer({
    mapTypeId: google.maps.MapTypeId.SATELLITE
  }));
};


document.getElementById('gm-add-ter').onclick = function() {
  map.getLayers().push(new GoogleLayer({
    mapTypeId: google.maps.MapTypeId.TERRAIN
  }));
};


document.getElementById('gm-toggle-last').onclick = function() {
  let found = null;
  const layers = map.getLayers();

  // remove last one
  layers.getArray().slice(0).reverse().every(function(layer) {
    if (layer instanceof GoogleLayer) {
      found = layer;
      return false;
    }
    return true;
  }, this);

  if (found) {
    found.setVisible(!found.getVisible());
  }
};
