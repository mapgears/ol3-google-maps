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

  var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        return feature;
      });

  if (feature) {
    this.coordinate_ = evt.coordinate;
    this.feature_ = feature;
  }

  return !!feature;
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
app.Drag.prototype.handleDragEvent = function(evt) {
  var map = evt.map;

  var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        return feature;
      });

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
    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
          return feature;
        });
    var element = evt.map.getTargetElement();
    if (feature) {
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
  var feature;
  for (var i = 0; i < len; i++) {
    feature = generatePointFeature();
    if (opt_style) {
      var style = new ol.style.Style(opt_style);
      style.setZIndex(Math.floor(Math.random() * 1000));
      feature.setStyle(style);
    }
    vector.getSource().addFeature(feature);
  }
};

var addMarkerFeatures = function(len) {
  addPointFeatures(len, {
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
