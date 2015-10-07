var center = [-10997148, 4569099];

var googleLayer = new olgm.layer.Google();

var wmsLayer =  new ol.layer.Image({
    extent: [-13884991, 2870341, -7455066, 6338219],
    source: new ol.source.ImageWMS({
      url: 'http://demo.boundlessgeo.com/geoserver/wms',
      params: {'LAYERS': 'topp:states'},
      serverType: 'geoserver'
    })
});

var map = new ol.Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: olgm.interaction.defaults(),
  layers: [
    googleLayer,
    wmsLayer,
  ],
  target: 'map',
  view: new ol.View({
    center: center,
    zoom: 4
  })
});

var olGM = new olgm.OLGoogleMaps({map: map}); // map is the ol.Map instance
olGM.activate();
