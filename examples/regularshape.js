var center = [-7908084, 6177492];

// This dummy layer tells Google Maps to switch to its default map type
var googleLayer = new olgm.layer.Google();

var osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: false
});

var stroke = new ol.style.Stroke({color: 'black', width: 2});

var styles = {
  'square': [new ol.style.Style({
    image: new ol.style.RegularShape({
      fill: new ol.style.Fill({color: 'red'}),
      stroke: stroke,
      points: 4,
      radius: 10,
      angle: Math.PI / 4
    })
  })],
  'triangle': [new ol.style.Style({
    image: new ol.style.RegularShape({
      fill: new ol.style.Fill({color: 'yellow'}),
      stroke: stroke,
      points: 3,
      radius: 10,
      rotation: Math.PI / 4,
      angle: 0
    })
  })],
  'star': [new ol.style.Style({
    image: new ol.style.RegularShape({
      fill: new ol.style.Fill({color: 'green'}),
      stroke: stroke,
      points: 5,
      radius: 10,
      radius2: 4,
      angle: 0
    })
  })],
  'pentagon': [new ol.style.Style({
    image: new ol.style.RegularShape({
      fill: new ol.style.Fill({color: 'blue'}),
      stroke: stroke,
      points: 5,
      radius: 10,
      angle: 0,
    })
  })],
  'x': [new ol.style.Style({
    image: new ol.style.RegularShape({
      stroke: stroke,
      points: 4,
      radius: 10,
      radius2: 0,
      angle: Math.PI / 4
    })
  })]
};


var styleKeys = ['x', 'pentagon', 'star', 'triangle', 'square'];
var count = 50;
var features = new Array(count);
var spread = 20000;
for (var i = 0; i < count; ++i) {
  var x = center[0]-(spread/2) + Math.random()*spread;
  var y = center[1]-(spread/2) + Math.random()*spread;
  var coordinates = [x, y];
  features[i] = new ol.Feature(new ol.geom.Point(coordinates));
  var style = styles[styleKeys[Math.floor(Math.random() * 5)]][0];
  features[i].setStyle(style);
}

var source = new ol.source.Vector({
  features: features
});

var vectorLayer = new ol.layer.Vector({
  source: source
});

var map = new ol.Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: olgm.interaction.defaults(),
  layers: [
    googleLayer,
    osmLayer,
    vectorLayer
  ],
  target: 'map',
  view: new ol.View({
    center: center,
    zoom: 12
  })
});

var olGM = new olgm.OLGoogleMaps({map: map}); // map is the ol.Map instance
olGM.activate();

function toggleOSM() {
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
};
