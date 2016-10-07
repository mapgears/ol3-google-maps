OL3-Google-Maps
===============

[![Build Status](https://travis-ci.org/mapgears/ol3-google-maps.svg)](https://travis-ci.org/mapgears/ol3-google-maps)

OpenLayers - Google Maps integration library. Create a map using
[OpenLayers 3](http://openlayers.org/) with the possibility to use Google Maps
as base map and much more.


Features
--------

Synchronizes:

 - Layers (Google, Vector)
 - Vector features (style, geometry)


Quick start
-----------

To use OL3-Google-Maps, first you need to load Google Maps API. It's important to load Google Maps API **before** OL3-Google-Maps. You also need to use your own Google Maps API key.

    <script
      type="text/javascript"
      src="https://maps.googleapis.com/maps/api/js?v=3&key=<YOUR_KEY>">
    </script>

Then, load the OL3-Google-Maps script included in the tarball of the version you downloaded, which already includes OpenLayers so you don't need to load OpenLayers too.

    <script type="text/javascript" src="ol3gm.js"></script>

It is recommended to load the CSS file included in there as well.

    <link rel="stylesheet" href="ol3gm.css" type="text/css" />

Then, in your existing OpenLayers application, activate OL3-Google-Maps. Here's a simple example:

    var center = [-7908084, 6177492];

    // This dummy layer tells Google Maps to switch to its default map type
    var googleLayer = new olgm.layer.Google();

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

    var olGM = new olgm.OLGoogleMaps({map: map}); // map is the ol.Map instance
    olGM.activate();


Live examples
-------------

See OL3-Google-Maps in action:

 * [Simple](http://mapgears.github.io/ol3-google-maps/examples/dist/examples/simple.html)
 * [Vector](http://mapgears.github.io/ol3-google-maps/examples/dist/examples/vector.html)
 * [Label](http://mapgears.github.io/ol3-google-maps/examples/dist/examples/label.html)
 * [Concept](http://mapgears.github.io/ol3-google-maps/examples/dist/examples/concept.html)

See all other examples at:
http://mapgears.github.io/ol3-google-maps/examples/


Developing
-----------

See the [developing](DEVELOPING.md) instructions if you want to contribute
new features or patches to OL3-Google-Maps.


Known Limitations
-----------------

Please see the known [limitations](LIMITATIONS.md) of this library in details.


Bugs and issues
---------------

For bugs or feature requests, use the
[issue tracker](https://github.com/mapgears/ol3-google-maps/issues)

If you need help with the library, use
[StackOverflow under the ol3-google-maps tag](http://stackoverflow.com/questions/tagged/ol3-google-maps)
