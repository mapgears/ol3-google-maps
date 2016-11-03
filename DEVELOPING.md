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

The first time you run this command, you will be asked for a Google Maps API
key. If you don't already have one, follow the instructions on
[this page](https://developers.google.com/maps/documentation/javascript/get-api-key)
to create one.

Then, just point your browser <http://localhost:3000/examples> in your browser.

To build the examples for deployment, use the `dist-examples` build target.

## Contributing

To contribute to the project, create a branch tracking master and work from
there. Feel free to create several small commits for each of your changes, they
will be squashed into one commit when the branch is merged. When your fix is
complete, create a pull request
[here](https://github.com/mapgears/ol3-google-maps/pulls).

When creating a commit for this project, do not include the modifications in
the examples that involve changing the API key for your own. To revert these
changes, you can run the script located in `tasks/resetkey.sh`. You can also
choose which lines to add to a commit with the `git add -p <file>` command.


## Google Maps externs file

See: https://github.com/google/closure-compiler/tree/master/contrib/externs/maps