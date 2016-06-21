---
layout: default
title: ol3-google-maps
---

### What is ol3-google-maps? ###

OL3-Google-Maps is an open-source library that allows users to add Google
Maps layers to a OpenLayers 3 map. It works by replicating and synchronising
the objects on the OL3 map to the Google Maps map, using their own mapping
API. All calls made on the user side are written as OL3 calls, so there is no
new syntax to learn.

### Using the library ###

To use the library, you need to include the ol3-google-maps script as well as
the Google Maps API:

```javascript
<script src="https://maps.googleapis.com/maps/api/js?v=3.21&key=mykey"></script>
<script src="ol3gm.js"></script>
```

In this example, `mykey` is your Google Maps API key, and ol3gm.js is the
compiled ol3-google-maps script. You don't need to load ol3 since it's included
with ol3-google-maps.

### Creating a simple map ###

```javascript
// Create a Google Maps layer
var googleLayer = new olgm.layer.Google();

// Create a regular OL3 map, containing our Google layer
var map = new ol.Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: olgm.interaction.defaults(),
  layers: [
    googleLayer
  ],
  target: 'map',
  view: new ol.View({
    center: center,
    zoom: 12
  })
});

// Activate the library
var olGM = new olgm.OLGoogleMaps({map: map});
olGM.activate();
```

There are three steps in this example:

1. Create a Google Maps layer. This is not mandatory, but if you do not use a
google maps layer, there's no point in using this library.

2. Create a map containing the Google Maps layer. Other layers of your choice
can be included as well.

3. Activate the library. This tells the library to hide OL3 layers and render
them using the Google Maps API instead.
