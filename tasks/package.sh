#!/bin/bash

# save current directory cd to script directory
DEST_DIR=$(pwd)
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

PREFIX="ol3-google-maps"
dirname=""

# Check for appropriate usage of the command
if [ $# != 1 ];
then
    echo "Usage: package.sh <version>"
    exit 1
fi

# Build the file name
VERSION=$1
dirname+=$PREFIX
dirname+="-"
dirname+=$VERSION

# Create a folder containing the appropriate files
mkdir $dirname
cp ../dist/ol3gm-debug.js $dirname
cp ../dist/ol3gm.js $dirname
cp ../css/ol3gm.css $dirname

# Zip the folder
filename=$dirname".zip"
zip -r $filename $dirname

# Clean up
mv $filename $DEST_DIR
rm -rf $dirname
