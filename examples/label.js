var center = [-7908084, 6177492];

var googleLayer = new olgm.layer.Google();

var osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: false
});

var source = new ol.source.Vector();
var feature = new ol.Feature(new ol.geom.Point(center));
feature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
      'fill': new ol.style.Fill({color: 'rgba(153,51,51,1)'}),
      'stroke': new ol.style.Stroke({color: 'rgb(30,30,30)', width: 2}),
      'radius': 20
    }),
    text: new ol.style.Text({
      font: 'normal 12pt Arial',
      text: '930',
      fill: new ol.style.Fill({color: 'black'}),
      stroke: new ol.style.Stroke({color: 'white', width: 3})
    })
  }));

var feature2 = new ol.Feature(new ol.geom.Point([-7907700, 6176600]));
feature2.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
      'fill': new ol.style.Fill({color: 'rgba(51,153,51,1)'}),
      'stroke': new ol.style.Stroke({color: 'rgb(30,30,30)', width: 2}),
      'radius': 20
    }),
    text: new ol.style.Text({
      font: 'normal 18pt Arial',
      text: 'Hi',
      fill: new ol.style.Fill({color: 'black'}),
      stroke: new ol.style.Stroke({color: 'white', width: 3})
    })
  }));

var feature3 = new ol.Feature(ol.geom.Polygon.fromExtent(
    [-7920319, 6176097, -7914143, 6179053]));

feature3.setStyle(new ol.style.Style({
  fill: new ol.style.Fill({color: 'rgba(51,153,51,1)'}),
  stroke: new ol.style.Stroke({color: 'rgb(30,30,30)', width: 2}),
  text: new ol.style.Text({
    textAlign: 'left',
    textBaseline: 'bottom',
    font: 'normal 11pt Arial',
    text: 'Bottom-Left',
    fill: new ol.style.Fill({color: 'white'})
  })
}));

var marker = new ol.Feature(new ol.geom.Point([-7912700, 6176500]));
marker.setStyle(new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: 'data/icon.png'
    })),
    text: new ol.style.Text({
      offsetX: 0,
      offsetY: -32,
      font: 'normal 20pt Courrier',
      text: 'X',
      fill: new ol.style.Fill({color: 'black'}),
      stroke: new ol.style.Stroke({color: 'white', width: 4})
    })
  }));

source.addFeatures([feature, feature2, feature3, marker]);

// Add some randomly generated markers

var markers = [];
var letters = "abcdefghijklmnopqrstuvwxyz"

for (var i = 0; i < 10; i++) {
  var x = Math.floor((Math.random() * 10000) - 7912700);
  var y =  Math.floor((Math.random() * 10000) + 6171500);
  var marker = new ol.Feature(new ol.geom.Point([x, y]));
  marker.setStyle(new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'data/icon.png'
      })),
      text: new ol.style.Text({
        offsetX: 0,
        offsetY: -32,
        font: 'normal 14pt Courrier',
        text: letters.charAt(i) + letters.charAt(i+1),
        fill: new ol.style.Fill({color: 'black'}),
        stroke: new ol.style.Stroke({color: '#aaffaa', width: 6}),
      }),
      zIndex: i
    })
  );
  markers.push(marker);
}

source.addFeatures(markers);

var vector = new ol.layer.Vector({
  source: source
});

var map = new ol.Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: olgm.interaction.defaults(),
  layers: [
    googleLayer,
    osmLayer,
    vector
  ],
  target: 'map',
  view: new ol.View({
    center: center,
    zoom: 12
  })
});

var olGM = new olgm.OLGoogleMaps({
  map: map,
  mapIconOptions: {
    useCanvas: true
  }
}); // map is the ol.Map instance
olGM.activate();


function toggle() {
  googleLayer.setVisible(!googleLayer.getVisible());
  osmLayer.setVisible(!osmLayer.getVisible());
};
