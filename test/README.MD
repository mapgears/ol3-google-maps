## Guidelines ##

### Where to write tests ###

Place your tests in the test/spec folder. The name of the test file should be
the same as the name of the source file that contains the code you're testing,
except that the extension will be `.test.js` instead of `.js`.

### Writing tests ###

All tests are combined into a single file, and they are all run on the same
HTML file. Therefore, all variables you set must be unset in the same test.
The state of the page should be the same before and after the tests.

### Running tests ###

`npm test` or `tasks/runtests.sh`
