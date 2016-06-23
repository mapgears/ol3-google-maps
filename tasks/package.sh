#!/bin/bash

# cd to script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

# 1==zip, 0==tgz
zip=1

PREFIX="ol3-google-maps"
#PREFIX=""

#VERSION="dev"

dirname=""

if [ $# != 1 ];
then
    echo "Usage: package.sh <version>"
    exit 1
fi

VERSION=$1

if [ "$PREFIX" != "" ];
then
    dirname+=$PREFIX
fi

if [ "$VERSION" != "" ];
then
    if [ "$dirname" != "" ];
    then
        dirname+="-"
    fi
    dirname+=$VERSION
fi


mkdir $dirname
cp ../dist/ol3gm-debug.js $dirname
cp ../dist/ol3gm.js $dirname
cp ../css/ol3gm.css $dirname

if [ "$zip" == "1" ];
then
    filename=$dirname".zip"
    zip -r $filename $dirname
else
    filename=$dirname".tar.gz"
    tar czf $filename $dirname
fi

rm -rf $dirname
