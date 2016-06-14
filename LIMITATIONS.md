Limitations of OL3-Google-Maps Library
======================================

The OL3-Google-Maps library comes with several limitations as both OpenLayers 3
and Google Maps aim towards very different goals. The limitations that are
known are listed here. If you come across something not listed here, you may
open a
[new issue on GitHub](https://github.com/mapgears/ol3-google-maps/issues/new).

Before jumping into details about each one, note that the sole purpose of this
library is to allow developers of web mapping applications to enjoy both
OpenLayers 3 and Google Maps libraries together. If either of the two
is enough to fit the requirements of the application you want to develop, then
it is strongly recommended to just pick one and build it on top of it.


Clusters
--------

Clusters are not yet supported as no development towards it has been made yet.

Recommendation: avoid using clusters.


Custom TileGrid with `ol.layer.Tile`
------------------------------------

It's possible to assign a custom tile grid to a tile layer. However, the
extent for the tile grid should cover the whole map for it to work with the
Google Maps API, otherwise it will appear in the top left corner.

Recommendation: set the TileGrid's extent to the default extent for that
projection: `ol.proj.get('EPSG:3857').getExtent()`


Google Maps is always at the bottom
-----------------------------------

When activated, the Google Maps map is placed below the OpenLayers one. Any
layers that would normally be in between them in the OpenLayers map will
all end up on top of Google Maps layers. Note that layers that are supported
(see below) won't be affected by this limitation.

Recommentation: avoid placing layers between the Google Maps ones in your OL3
map and make sure they are always at the bottom too, for simplicity.


Kinetic pan
-----------

The `ol.interaction.DragPan` interaction is added by default to the map with
the `kinetic` option enabled, allowing the map to be panned using kinetic
effects. While the kinetic animation is in progress, the center of the map
is where the animation will end. This has the downside effect to instantly
panning to the end location if a Google Maps layer is active and visible.
To avoid this, it is not recommended to use the kinetic effects.

Recommendation: use `interactions: olgm.interactions.defaults()` in your OL3
map options, in which the interation that does kinetic animation while panning
the map is not included.


Layers (Supported)
------------------

The following layers are currently supported by this library, i.e. they are
rendered directly in Google Maps for a smooth effect while interacting the map:

 * `ol.layer.Vector`
 * `olgm.layer.Google`
 * `ol.layer.Image` with `ol.source.ImageWMS`
 * `ol.layer.Tile` with `ol.source.TileWMS` and `ol.source.WMTS`

All the other layers currently stay in OpenLayers, on top of Google Maps.

Recommendation: use only supported layers in your map.


Rotation
--------

OpenLayers 3 supports rotating the map in a 'free' way, i.e. the view of the
map can be rotated in any direction, in any angle.  Google Maps also supports
rotating the map, but not as freely.  For that reason, it is not recommended
to allow your maps to be rotated at all when using this library.

Recommendation: use `interactions: olgm.interactions.defaults()` in your OL3
map options, in which the interations that allow rotating the map are not
included.


Style Functions
---------------

Style functions as style definition are not supported yet.

Recommendation: use a plain `ol.style.Style` object for you style definition.

Style Arrays
---------------

Style arrays as style definition are not supported yet.

Recommendation: use a plain `ol.style.Style` object for you style definition.



Vector features
---------------

Google Maps API uses several layers to render its vector features. They are
known a
[MapPanes](https://developers.google.com/maps/documentation/javascript/reference#MapPanes),
each having a fixed Z order.  Polygons and Linestrings are rendered in the
`overlayLayer` (Pane 1). Points are rendered in the `markerLayer` (Pane 2).

This means that the Z order defined in OpenLayers is not exactly the same
in Google Maps.



Vector labels (text)
--------------------

Vector labels, i.e. text styling definition, are supported but come with
several limitations. Before jumping into those, note that OL3-Google-Maps
focuses on having the labels on the Z order they are added, i.e. a polygon
added after a label should be rendered on top of the text.

Limitations:

 * the `rotation` option is currently not supported
 * in the Google Maps map, the labels are rendered in the `markerLayer`
   (Pane 2), which makes the Z order of labels not working as expected
   for polygons and linestring
 * in Google Maps, markers that use image as source are rendered in tiles,
   which ignore the Z order defined per feature. This causes the labels
   to always appear on top of all markers.
 * updating a label geometry is slow, which affects the visual smoothness
   of dragging a feature on the map
