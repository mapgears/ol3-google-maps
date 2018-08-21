# Developing

## Setting up development environment

You will obviously start by
[forking](https://github.com/mapgears/ol3-google-maps/fork) the
ol3-google-maps repository.


### Development dependencies

The minimum requirements are:

* Git
* [Node.js](http://nodejs.org/) (version 8 and above)

The executables `git` and `node` should be in your `PATH`.

To install the Node.js dependencies run

    $ npm install

## Running examples

Before you run any examples, you must assign your Google Maps API key to the
environment variable GOOGLE_MAPS_API_KEY. If you don't already have one, follow
the instructions on
[this page](https://developers.google.com/maps/documentation/javascript/get-api-key)
to create one.

Then you can start the dev server:

    $ npm run serve-examples

Then, load <http://localhost:8080/> in your browser.

## Google Maps externs file

See: https://github.com/google/closure-compiler/tree/master/contrib/externs/maps