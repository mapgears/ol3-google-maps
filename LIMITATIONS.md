Limitations of OL3-Google-Maps Library
======================================

The OL3-Google-Maps library comes with several limitations as both OpenLayers 3
and Google Maps aim towards very different goals. The limitations that are
known are listed here. If you come across something not listed here, you may
open a
(new issue on GitHub)[https://github.com/mapgears/ol3-google-maps/issues/new].

Before jumping into details about each one, note that the sole purpose of this
library is to allow developers of web mapping applications to enjoy both
OpenLayers 3 and Google Maps libraries together. If either of the two
is enough to fit the requirements of the application you want to develop, then
it is strongly recommended to just pick one and build it on top of it.


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

All the other layers currently stay in OpenLayers, on top of Google Maps. The
following layers have plans to be supported soon:

 * `ol.layer.Image` with `ol.source.WMS`
 * `ol.layer.Tile` with `ol.source.TileWMS`

Recommentation: use only supported layers in you map.


Rotation
--------

OpenLayers 3 supports rotating the map in a 'free' way, i.e. the view of the
map can be rotated in any direction, in any angle.  Google Maps also supports
rotating the map, but not as freely.  For that reason, it is not recommended
to allow your maps to be rotated at all when using this library.

Recommendation: use `interactions: olgm.interactions.defaults()` in your OL3
map options, in which the interations that allow rotating the map are not
included.


Vector labels (text)
--------------------

Vector labels are not yet supported by this library.  They should be in the
next release.

Recommendation: stay tuned, they are coming soon!