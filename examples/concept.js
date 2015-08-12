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

var gmap = new google.maps.Map(document.getElementById('gmap'), {
  center: {
    lat: lat,
    lng: lng
  },
  zoom: zoom
});

var olgm = new olgm.OLGoogleMaps({
  ol3map: ol3map,
  gmap: gmap
});


olgm.toggle();

document.getElementById('map-type').onchange = function() {
  olgm.toggle();
};
