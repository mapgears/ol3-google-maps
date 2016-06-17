# Developing

## Setting up development environment

You will obviously start by
[forking](https://github.com/mapgears/ol3-google-maps/fork) the
ol3-google-maps repository.


### Development dependencies

The minimum requirements are:

* GNU Make
* Git
* [Node.js](http://nodejs.org/) (4.2.x or higher)
* Python 2.6 or 2.7
* Java 7 (JRE and JDK)

The executables `git`, `node`, and `java` should be in your `PATH`.

To install the Node.js dependencies run

    $ npm install


## Working with the build tool

As an ol3-google-maps developer you will use `make` to run build targets
defined in the `Makefile` located at the root of the repository.
The `Makefile` includes targets for running the linter, the compiler, etc.

The usage of `make` is as follows:

    $ make <target>

The main build targets are `serve`, `lint`, `dist`, `dist-examples` and
`check`. The latter is a meta-target that basically runs `lint` and `dist`.

The examples can be built for deployment with the `dist-examples` build target.
An optional `API_KEY` parameter can be provided:

    $ make [API_KEY=<key>] dist-examples

This will replace the Google Maps API key in the examples for the one provided.


## Running the `check` target

The `check` target is to be run before pushing code to GitHub and opening pull
requests.

To run the `check` target:

    $ make check


## Running examples

To run the examples you first need to start the dev server:

    $ make serve

Then, just point your browser <http://localhost:3000/examples> in your browser.

To build the examples for deployment, use the `dist-examples` build target.
