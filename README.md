# OL-Google-Maps

[![Build Status](https://travis-ci.org/mapgears/ol3-google-maps.svg)](https://travis-ci.org/mapgears/ol3-google-maps)

OpenLayers - Google Maps integration library. Create a map using [OpenLayers](http://openlayers.org/) with the possibility to use Google Maps as base map and much more.

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

## Developing

See the [developing](DEVELOPING.md) instructions if you want to
contribute new features or patches to OL3-Google-Maps or if you want
to see the examples in action using the latest version.

Note that contributions have to meet some minimum quality requirements
in order to be included in the official package, but that's the same
as with any mature open source project.

## Known Limitations

Please see the known [limitations](LIMITATIONS.md) of this library in details.

## Bugs and issues

For bugs or feature requests, use the
[issue tracker](https://github.com/mapgears/ol3-google-maps/issues)

If you need help with the library, use
[StackOverflow under the ol3-google-maps tag](http://stackoverflow.com/questions/tagged/ol3-google-maps)

## Our commitment

We, at Mapgears, are definitely committed to continuing to support
this project as long as it will make sense to do so. We use it for our
own products and for projects with our customers, and will continue to
make it evolve and address issues as we go as part of that work.

However, just like with any open source project, its development is
driven by the funding we can get through customer projects, so if
there are some limitations or issues that are important to you and
your organization, we'd be happy to provide you a quote for a support
package or for working on those specific limitations, and of course
you are also welcome to work on them yourself and contribute the fix.
