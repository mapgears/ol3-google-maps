var center = [-7908084, 6177492];

var regularLayer = new olgm.layer.Google({
  visible: false
});

var themedLayer = new olgm.layer.Google({
  styles: [{
    "stylers": [{
      "saturation": -100
    },{
       "gamma": 2.25
    }]
  }]
});

var map = new ol.Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: olgm.interaction.defaults(),
  layers: [
    regularLayer,
    themedLayer
  ],
  target: 'map',
  view: new ol.View({
    center: center,
    zoom: 12
  })
});

var olGM = new olgm.OLGoogleMaps({map: map}); // map is the ol.Map instance
olGM.activate();

function toggle() {
  regularLayer.setVisible(!regularLayer.getVisible());
  themedLayer.setVisible(!themedLayer.getVisible());
};
