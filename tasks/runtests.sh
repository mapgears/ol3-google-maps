#!/bin/bash

# cd to tests dir
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/../test"

# Find all test files and merge them in a single file
find . -name '*.test.js' -exec cat {} + >> tests.js

# Run tests
node ../node_modules/mocha-phantomjs index.html

# Delete combined tests file
rm tests.js
