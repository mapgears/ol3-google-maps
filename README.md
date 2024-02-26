# OL-Google-Maps

[![Build Status](https://travis-ci.org/mapgears/ol3-google-maps.svg)](https://travis-ci.org/mapgears/ol3-google-maps)

## OL-Google-Maps is deprecated

OpenLayers - Google Maps integration library, which is now deprecated.

The [OpenLayers](http://openlayers.org/) library now supports the possibility to use Google Maps as base maps from version [v9.0.0+](https://github.com/openlayers/openlayers/releases/tag/v9.0.0).

In the past, Google Maps did not provide an API to requests tiles directly. You had to use the Google Maps API for that. OLGM provided a way to indirectly use tiles from Google Maps by using its Maps API.

Now, Google have a [Map Tiles API](https://developers.google.com/maps/documentation/tile), which is what OpenLayers uses. Therefore, the use of the OLGM library is no longer recommended. You should upgrade to the latest version of OpenLayers.

## Features

Synchronizes:

* Layers (Google, Vector)
* Vector features (style, geometry)

## Getting started

For use with webpack, Rollup, Browserify, or other module bundlers, install the [`olgm` package](https://www.npmjs.com/package/olgm).

```
npm install olgm
```

You must also install the [`ol` package](https://www.npmjs.com/package/ol).

To use OL-Google-Maps, first you need to load Google Maps API. It's important to load Google Maps API **before** OL-Google-Maps. You also need to use your own Google Maps API key.

```
<script
  type="text/javascript"
  src="https://maps.googleapis.com/maps/api/js?v=3&key=<YOUR_KEY>">
</script>
```

It is recommended to load the CSS file included in there as well.

```
<link rel="stylesheet" href="ol3gm.css" type="text/css" />
```

Then, in your existing OpenLayers application, activate OL3-Google-Maps. Here's a simple example:

```
import Map from 'ol/Map.js';
import GoogleLayer from 'olgm/layer/Google.js';
import {defaults} from 'olgm/interaction.js';
import OLGoogleMaps from 'olgm/OLGoogleMaps.js';
import View from 'ol/View';

var center = [-7908084, 6177492];

// This dummy layer tells Google Maps to switch to its default map type
const googleLayer = new GoogleLayer();

var map = new Map({
  // use OL3-Google-Maps recommended default interactions
  interactions: defaults(),
  layers: [
    googleLayer
  ],
  target: 'map',
  view: new View({
    center: center,
    zoom: 12
  })
});

var olGM = new OLGoogleMaps({map: map}); // map is the ol.Map instance
olGM.activate();
```

## Live examples

See the following example for more detail on bundling OL3-Google-Maps with your application:

 * Using [Webpack](https://github.com/geopamplona/olgm-webpack)
 
See OL3-Google-Maps in action (version v0.20.0):

 * [Simple](http://mapgears.github.io/ol3-google-maps/examples/dist/examples/simple.html)
 * [Vector](http://mapgears.github.io/ol3-google-maps/examples/dist/examples/vector.html)
 * [Label](http://mapgears.github.io/ol3-google-maps/examples/dist/examples/label.html)
 * [Concept](http://mapgears.github.io/ol3-google-maps/examples/dist/examples/concept.html)

See all other examples at:
http://mapgears.github.io/ol3-google-maps/examples/

## The End

OLGM no longer needs development as it is now deprecated. Upgrade to the latest version of OpenLayers instead.

Thanks to everyone who contributed during the lifespan of the library!

