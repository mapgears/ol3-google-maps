// This dummy layer tells Google Maps to switch to its default map type
var googleLayer = new olgm.layer.Google();

var map = new ol.Map({
  // kinetic dragPan is not recommended, thus disabled here
  interactions: ol.interaction.defaults({
    dragPan: false
  }).extend([
    new ol.interaction.DragPan()
  ]),
  layers: [
    googleLayer
  ],
  target: 'map',
  view: new ol.View({
    center: ol.proj.transform([-70, 50], 'EPSG:4326', 'EPSG:3857'),
    zoom: 5
  })
});

var olGM = new olgm.OLGoogleMaps({map: map}); // map is the ol.Map instance
olGM.activate();
