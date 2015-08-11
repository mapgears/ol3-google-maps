var view = new ol.View({
  center: ol.proj.transform([-70, 50], 'EPSG:4326', 'EPSG:3857'),
  zoom: 5
});

var ol2d = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    })
  ],
  target: 'map2d',
  view: view
});


var olgm = new olgm.OLGoogleMaps({
  map: ol2d
});
