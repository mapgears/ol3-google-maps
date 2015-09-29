var lat = 50;
var lng = -70;
var zoom = 5;
//var extent = [-83, 44, -57, 55];
var extent = [-9259955, 5467881, -6324773, 7424669];

var osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: false
});

var ol3map = new ol.Map({
  // kinetic dragPan is not recommended, thus disabled here
  interactions: ol.interaction.defaults({
    dragPan: false
  }).extend([
    new ol.interaction.DragPan()
  ]),
  layers: [
    osmLayer,
    new olgm.layer.Google()
  ],
  target: 'ol3map',
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


var olgmMain = new olgm.OLGoogleMaps({
  ol3map: ol3map
});


var vector = new ol.layer.Vector({
  source: new ol.source.Vector()
});
ol3map.addLayer(vector);

olgmMain.activate();

document.getElementById('add-point').onclick = function() {
  vector.getSource().addFeature(generateFeature());
};

var generateFeature = function() {
  var extent = [-9259955, 5467881, -6324773, 7424669];
  var deltaX = extent[2] - extent[0];
  var deltaY = extent[3] - extent[1];
  var point = new ol.geom.Point([
    extent[0] + (deltaX * Math.random()),
    extent[1] + (deltaY * Math.random())
  ]);
  var feature = new ol.Feature(point);
  return feature;
};


var toggleOsmLayer = function(opt_visible) {
  var visible = opt_visible !== undefined ? opt_visible :
      !osmLayer.getVisible();
  osmLayer.setVisible(visible);
};

var showOSMLayer = function() {
  var found = null;
  var layers = ol3map.getLayers();

  layers.getArray().every(function(layer) {
    if (layer instanceof olgm.layer.Google) {
      found = layer;
      return false;
    }
    return true;
  }, this);

  toggleOsmLayer(!found);
};

document.getElementById('toggle-osm').onclick = function() {
  toggleOsmLayer();
};

document.getElementById('gm-rm-last').onclick = function() {
  var found = null;
  var layers = ol3map.getLayers();

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

  showOSMLayer();
};


document.getElementById('gm-add-sat').onclick = function() {
  ol3map.getLayers().push(new olgm.layer.Google({
    mapTypeId: google.maps.MapTypeId.SATELLITE
  }));
  showOSMLayer();
};


document.getElementById('gm-add-ter').onclick = function() {
  ol3map.getLayers().push(new olgm.layer.Google({
    mapTypeId: google.maps.MapTypeId.TERRAIN
  }));
  showOSMLayer();
};


document.getElementById('gm-toggle-last').onclick = function() {
  var found = null;
  var layers = ol3map.getLayers();

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
