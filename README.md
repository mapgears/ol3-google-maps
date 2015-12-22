OL3-Google-Maps
===============

OpenLayers - Google Maps integration library. Create a map using
[OpenLayers 3](http://openlayers.org/) with the possibility to use Google Maps
as base map and much more.


Features
--------

Synchronizes:

 - Layers (Google, Vector)
 - Vector features (style, geometry)


Live examples
-------------

See OL3-Google-Maps in action:

 * [Simple](http://dev5.mapgears.com/ol3-google-maps/examples/simple.html)
 * [Vector](http://dev5.mapgears.com/ol3-google-maps/examples/vector.html)
 * [Label](http://dev5.mapgears.com/ol3-google-maps/examples/label.html)
 * [Concept](http://dev5.mapgears.com/ol3-google-maps/examples/concept.html)

See all other example at:
http://dev5.mapgears.com/ol3-google-maps/examples/

Installation
------------

The ol3 folder is a submodule pointing to a specific commit in the [openlayers/ol3](https://github.com/openlayers/ol3) repository. First you need to initialize this submodule, basically populate the ol3 folder:

`git submodule update --init --recursive`

Then use `make` to do things like compiling a distribution for the library and running a development web server for examples. A complete list can be found on the help page:

`make help`


Known Limitations
-----------------

Please see the known [limitations](LIMITATIONS.md) of this library in details.


Stay tuned for more!
