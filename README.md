### Updating the examples ###

The library's website is auto-generated using Jekyll and Github Pages. It allows us to commit changes directly to the website's repository and view the changes soon after.

However, the examples are not generated automatically on the server's side.

1. `git checkout master` and `git pull` to be on the latest version
2. `make API_KEY=AIzaSyDIDCAbY9acmoT5c4ZbDFRlUBc-RHK2rTw dist-examples` to build the examples with the appropriate api key.

    Note: this key will only work on `mapgears.github.io`. To use the production examples outside of this repository, refer to Google's [pricing and plans](https://developers.google.com/maps/pricing-and-plans/).

3. `git checkout gh-pages` to checkout to the website's branch
4. `cp -r dist _examples/` to copy the compiled examples to the website's repository
5. Commit and push the changes. It should appear on the website a few minutes after.
