/**
 * Define a namespace for the application.
 */
window.app = {};
var app = window.app;



/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
app.Drag = function() {

  ol.interaction.Pointer.call(this, {
    handleDownEvent: app.Drag.prototype.handleDownEvent,
    handleDragEvent: app.Drag.prototype.handleDragEvent,
    handleMoveEvent: app.Drag.prototype.handleMoveEvent,
    handleUpEvent: app.Drag.prototype.handleUpEvent
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

};
ol.inherits(app.Drag, ol.interaction.Pointer);


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
app.Drag.prototype.handleDownEvent = function(evt) {
  var map = evt.map;

  var features = map.getFeaturesAtPixel(evt.pixel);

  if (features && features.length > 0) {
    this.coordinate_ = evt.coordinate;
    this.feature_ = features[0];
  }

  return features && features.length > 0;
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
app.Drag.prototype.handleDragEvent = function(evt) {
  var map = evt.map;

  var deltaX = evt.coordinate[0] - this.coordinate_[0];
  var deltaY = evt.coordinate[1] - this.coordinate_[1];

  var geometry = /** @type {ol.geom.SimpleGeometry} */
      (this.feature_.getGeometry());
  geometry.translate(deltaX, deltaY);

  this.coordinate_[0] = evt.coordinate[0];
  this.coordinate_[1] = evt.coordinate[1];
};


/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
app.Drag.prototype.handleMoveEvent = function(evt) {
  if (this.cursor_) {
    var map = evt.map;
    var features = map.getFeaturesAtPixel(evt.pixel);
    var element = evt.map.getTargetElement();
    if (features) {
      if (element.style.cursor != this.cursor_) {
        this.previousCursor_ = element.style.cursor;
        element.style.cursor = this.cursor_;
      }
    } else if (this.previousCursor_ !== undefined) {
      element.style.cursor = this.previousCursor_;
      this.previousCursor_ = undefined;
    }
  }
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
app.Drag.prototype.handleUpEvent = function(evt) {
  this.coordinate_ = null;
  this.feature_ = null;
  return false;
};


var lat = 50;
var lng = -70;
var zoom = 5;
//var extent = [-83, 44, -57, 55];
var extent = [-9259955, 5467881, -6324773, 7424669];

var osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: false
});

var map = new ol.Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: olgm.interaction.defaults().extend([
    new app.Drag()
  ]),
  layers: [
    osmLayer,
    new olgm.layer.Google()
  ],
  target: 'map',
  view: new ol.View({
    center: ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'),
    zoom: zoom
  })
});

// FIXME - style override, this should be managed internally
/*
gmap.data.setStyle({
  icon: 'resources/evouala.png'
});
*/


var vector = new ol.layer.Vector({
  source: new ol.source.Vector()
});
map.addLayer(vector);

var generateCoordinate = function() {
  var extent = [-9259955, 5467881, -6324773, 7424669];
  var deltaX = extent[2] - extent[0];
  var deltaY = extent[3] - extent[1];
  return [
    extent[0] + (deltaX * Math.random()),
    extent[1] + (deltaY * Math.random())
  ];
};

var generatePointFeature = function() {
  return new ol.Feature(
    new ol.geom.Point(generateCoordinate())
  );
};

var generateLineFeature = function() {
  var coordinates = [];
  for (var i = 0, len = 3; i < len; i++) {
    coordinates.push(generateCoordinate());
  }
  return new ol.Feature(
    new ol.geom.LineString(coordinates)
  );
};

var addPointFeatures = function(len, opt_style) {
  var features = [];
  var feature;
  for (var i = 0; i < len; i++) {
    feature = generatePointFeature();
    if (opt_style) {
      var style = new ol.style.Style(opt_style);
      style.setZIndex(Math.floor(Math.random() * 1000));
      feature.setStyle(style);
    }
    vector.getSource().addFeature(feature);
    features.push(feature);
  }
  return features;
};

var addMarkerFeatures = function(len) {
  var points = addPointFeatures(len, {
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 0.75,
      src: 'data/icon.png'
    })),
    text: new ol.style.Text({
      offsetX: 0,
      offsetY: -32,
      font: 'normal 14pt Courrier',
      text: 'hi',
      fill: new ol.style.Fill({color: 'black'}),
      stroke: new ol.style.Stroke({color: '#ffffff', width: 5}),
    })
  });

  setTimeout(function() {
    var style = points[0].getStyle();
    var text = style.getText().clone();
    text.setText('HI');
    style.setText(text);
    // set the style after the feature has rendered, which tests herald
    points[0].setStyle(style);
  }, 1000);
};

var addCircleFeatures = function(len) {
  addPointFeatures(len, {
    image: new ol.style.Circle({
      'fill': new ol.style.Fill({color: 'rgba(153,51,51,0.3)'}),
      'stroke': new ol.style.Stroke({color: 'rgb(153,51,51)', width: 2}),
      'radius': 20
    })
  });
};

var addLineFeatures = function(len, opt_style) {
  var feature;
  for (var i = 0; i < len; i++) {
    feature = generateLineFeature();
    if (opt_style) {
      feature.setStyle(opt_style);
    }
    vector.getSource().addFeature(feature);
  }
};


addPointFeatures(3);
addPointFeatures(3, {
  image: new ol.style.Circle({
    'fill': new ol.style.Fill({color: '#3F5D7D'}),
    'stroke': new ol.style.Stroke({color: 'rgb(30,30,30)', width: 2}),
    'radius': 20
  }),
  text: new ol.style.Text({
    font: 'normal 16pt Arial',
    text: '42',
    fill: new ol.style.Fill({color: 'black'}),
    stroke: new ol.style.Stroke({color: 'white', width: 3})
  })
});
addMarkerFeatures(3);
addCircleFeatures(3);
addLineFeatures(1);
// line with custom style
addLineFeatures(1, new ol.style.Style({
  stroke: new ol.style.Stroke({
    width: 4,
    color: '#CC3333'
  })
}));
// add polygon feature
vector.getSource().addFeature(new ol.Feature(
  new ol.geom.Polygon.fromExtent([-8259955, 6067881, -7324773, 6524669])
));
// add polygon feature with custom style
var poly2 = new ol.Feature(
  new ol.geom.Polygon.fromExtent([-8159955, 6167881, -7124773, 6724669])
);
poly2.setStyle(new ol.style.Style({
  fill: new ol.style.Stroke({
    color: 'rgba(63,93,125,0.4)'
  }),
  stroke: new ol.style.Stroke({
    width: 4,
    color: 'rgba(63,93,125,0.8)'
  })
}));
vector.getSource().addFeature(poly2);

//Draw some waves over by St. John's
vector.getSource().addFeature(new ol.Feature(
  new ol.geom.MultiLineString([
  [
[-5974691,6487857],[-5949008,6489080],[-5930052,6498253],[-5923937,6514151],[-5923937,6528216],[-5931275,6542280],[-5947785,6552676],[-5938613,6564294],[-5917211,6569186],[-5890916,6564906],[-5870737,6542280],[-5864622,6528216],[-5856673,6508036],[-5849946,6494584],[-5831601,6481742],[-5807141,6481742]
  ],
  [ [-5759445,6590588],[-5733762,6591811],[-5714806,6600984],[-5708691,6616882],[-5708691,6630947],[-5716029,6645011],[-5732539,6655407],[-5723367,6667025],[-5701965,6671917],[-5675670,6667637],[-5655491,6645011],[-5649376,6630947],[-5641427,6610767],[-5634700,6597315],[-5616355,6584473],[-5591895,6584473]
  ],
  [ [-5842608,6345990],[-5816925,6347213],[-5797969,6356386],[-5791854,6372284],[-5791854,6386349],[-5799192,6400413],[-5815702,6410809],[-5806530,6422427],[-5785128,6427319],[-5758833,6423039],[-5738654,6400413],[-5732539,6386349],[-5724590,6366169],[-5717863,6352717],[-5699518,6339875],[-5675058,6339875]
  ],
  [
[-6189937,6590588],[-6164254,6591811],[-6145298,6600984],[-6139183,6616882],[-6139183,6630947],[-6146521,6645011],[-6163031,6655407],[-6153859,6667025],[-6132457,6671917],[-6106162,6667637],[-6085983,6645011],[-6079868,6630947],[-6071919,6610767],[-6065192,6597315],[-6046847,6584473],[-6022387,6584473]
  ],
  ])
));

//Add multipoint features (amorphouse polygons over the great lakes)
vector.getSource().addFeature(new ol.Feature(
  new ol.geom.MultiPoint([
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
vector.getSource().addFeature(new ol.Feature(
  new ol.geom.MultiPolygon([[
    [
      [-9665988, 6059810],
      [-9763828, 6020674],
      [-9763828, 5883699],
      [-9631745, 5859239],
      [-9548581, 5952186],
      [-9548581, 6015782],
    ],
    [
      [-9582825, 6103837],
      [-9533905, 6089162],
      [-9470310, 6138081],
      [-9529013, 6206569],
      [-9582825, 6162541],
      [-9612177, 6133189],
    ],
    [
      [-9411606, 5771184],
      [-9255063, 5653776],
      [-9030032, 5560829],
      [-9078952, 5688020],
      [-8946869, 5658668],
      [-8951761, 5800535],
      [-9083844, 5780967],
    ],
  ]])
));


// Add movable multi-polygon (pinwheel over ontario)
var multiCoords = []
for (i = 0; i < 8; i++) {
  var p = new ol.geom.Polygon([[
    [-9670881, 6798497],
    [-9748937, 6989284],
    [-9690449, 7180071],
    [-9612178, 6979500],
  ]]);
  p.rotate(i * Math.PI / 4, [-9770881, 6798497]);
  multiCoords = multiCoords.concat(p.getCoordinates())
}
var poly3 = new ol.Feature(new ol.geom.MultiPolygon([multiCoords]))
var vectorForMultiPoly = new ol.layer.Vector({
  source: new ol.source.Vector(),
  style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: [233, 150, 36, 0.1]
        }),
        stroke: new ol.style.Stroke({
          color: [233, 150, 36, 1],
          width: 1,
        })
      })
});
map.addLayer(vectorForMultiPoly);
vectorForMultiPoly.getSource().addFeature(poly3);
select = new ol.interaction.Select({
  layers: [vectorForMultiPoly],
  toggleCondition: ol.events.condition.never,
  condition: function(event){
    if (event.type == "click"){
      console.log(event.coordinate)
    }
    return event.type == 'pointermove'; },
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: [255, 23, 180, 0.2]
    }),
    stroke: new ol.style.Stroke({
      color: [255, 23, 180, 1]
    })
  }),
})
map.addInteraction(select)


var olGM = new olgm.OLGoogleMaps({
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


var toggleOsmLayer = function(opt_visible) {
  var visible = opt_visible !== undefined ? opt_visible :
      !osmLayer.getVisible();
  osmLayer.setVisible(visible);
};

document.getElementById('toggle-osm').onclick = function() {
  toggleOsmLayer();
};

document.getElementById('gm-rm-last').onclick = function() {
  var found = null;
  var layers = map.getLayers();

  // remove last one
  layers.getArray().slice(0).reverse().every(function(layer) {
    if (layer instanceof olgm.layer.Google) {
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
  map.getLayers().push(new olgm.layer.Google({
    mapTypeId: google.maps.MapTypeId.SATELLITE
  }));
};


document.getElementById('gm-add-ter').onclick = function() {
  map.getLayers().push(new olgm.layer.Google({
    mapTypeId: google.maps.MapTypeId.TERRAIN
  }));
};


document.getElementById('gm-toggle-last').onclick = function() {
  var found = null;
  var layers = map.getLayers();

  // remove last one
  layers.getArray().slice(0).reverse().every(function(layer) {
    if (layer instanceof olgm.layer.Google) {
      found = layer;
      return false;
    }
    return true;
  }, this);

  if (found) {
    found.setVisible(!found.getVisible());
  }
};
