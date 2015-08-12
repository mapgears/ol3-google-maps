var lat = 50;
var lng = -70;
var zoom = 5;

var ol3map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    })
  ],
  target: 'ol3map',
  view: new ol.View({
    center: ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'),
    zoom: zoom
  })
});

// The GoogleMaps map doesn't get any initial center nor zoom.  It will
// get them from the OL3 map upon activation.
var gmap = new google.maps.Map(document.getElementById('gmap'));

var olgm = new olgm.OLGoogleMaps({
  ol3map: ol3map,
  gmap: gmap
});


olgm.toggle();

document.getElementById('map-type').onchange = function() {
  olgm.toggle();
};
