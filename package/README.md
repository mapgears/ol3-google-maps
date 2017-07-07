olgm
===============

OpenLayers - Google Maps integration library as ES2015 modules to use with [`ol`](https://www.npmjs.com/package/ol).


Usage
-----

Add the `olgm` package as a dependency to your project.

    npm install olgm --save

`ol` will be installed as a peer dependency.

To use `olgm`, the Google Maps API must be loaded externally. It's important to load Google Maps API **before** your bundle. You also need to use your own Google Maps API key.

    <script
      type="text/javascript"
      src="https://maps.googleapis.com/maps/api/js?v=3&key=<YOUR_KEY>">
    </script>
    <script type="text/javascript" src="bundle.js"></script>

It is recommended to import `olgm/ol3gm.css` along with `ol/ol.css`, for instance using [`style-loader`](https://github.com/webpack-contrib/style-loader).

Then, in your existing OpenLayers application, activate OL-Google-Maps. Here's a simple example:

    import 'ol/ol.css';
    import 'olgm/ol3gm.css';

    import Map from 'ol/map';
    import View from 'ol/view';
    import Google from 'olgm/layer/google';
    import interaction from 'olgm/interaction';
    import OLGoogleMaps from 'olgm/olgooglemaps';

    var center = [-7908084, 6177492];

    // This dummy layer tells Google Maps to switch to its default map type
    var googleLayer = new Google();

    var map = new Map({
      // use OL3-Google-Maps recommended default interactions
      interactions: interaction.defaults(),
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

`olgm` modules work like `ol` modules. Consult [the `ol` documentation](https://www.npmjs.com/package/ol) for how to use the modules and how to bundle `ol` and `olgm` with your application.
