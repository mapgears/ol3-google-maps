## Release Procedure ##

### Checkout master ###

Update your repository with `git checkout master` and make sure there are no
changes when running `git status`.

### Run linter and tests ###

Type `npm run lint` to run the linter.

Type `npm run test` to test the building of the JS code.

### Create a changelog ###

You can generate a changelog file by running the following command:

    ./tasks/changelog.sh v0.7.0.. > changelog/v0.8.0.md

In this example, `v0.7.0` is the last release, and `v0.8.0` is the one about to
be created.

Commit the changelog:

    git add changelog
    git commit -m 'Changelog for v0.8.0'


### Update the package version number ###

We track our current version in `package.json` for npm. Set the new version
number in the `"version"` attribute, without the `v` prefix.

Then, commit and push the changes:

    npm install
    git add package.json package-lock.json
    git commit -m 'Update package version to 0.8.0'
    git push origin
    git push upstream

This should be the last commit before the release.


### Create a tag ###

We need to create a tag for the new version, and push it to our branch (and
upstream):

    git tag -a v0.8.0 -m '0.8.0'
    git push origin --tags
    git push upstream --tags

### Create a distributable package ###

OLGM currently no longer distribute a package.

### Create the release description on GitHub ###

With the tag pushed, a new release will appear on the
[releases](https://github.com/mapgears/ol3-google-maps/releases) page. Create a
description including the major points and the changelog.

### Publish to npm ###

You'll need to have a npm account and be a contributor to the project
in order to publish a new release.

Run:

```
npm run publish
```


### Update the website ###

FIXME - these instructions are deprecated. In order for these pages to
work, we would need to have a distribution package.

The website should be updated with the latest compiled examples and a link to
the packaged library.

First, on master, run the following command:

    git checkout master
    make API_KEY=AIzaSyDIDCAbY9acmoT5c4ZbDFRlUBc-RHK2rTw dist-examples

This will generate the examples with the appropriate api key for our website.

Then, checkout to the website's branch, and get the latest version:

    git checkout gh-pages
    git pull

Update the compiled examples and library, then commit the changes:

    cp -r dist _examples/
    git add _examples/
    git commit -m 'Update examples for v0.8.0'

The link to the latest distribution also needs to be updated. The link to be
changed is located in the download section of the following files:

 * `_layouts/default.html`
 * `_layouts/example-list.html`

It should point to the package uploaded in the release's description.

Finally, commit and push the changes

    git add _layouts
    git commit -m 'Update distribution link for v0.8.0'
    git push origin
    git push upstream

### Announce the release ###

Post an email on the
[openlayers-dev](https://groups.google.com/forum/#!forum/openlayers-dev)
mailing list announcing the release.
