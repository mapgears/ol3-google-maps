#!/bin/bash

echo "Enter a Google Maps API Key for localhost, or press enter to skip: "
read api_key

# Get examples directory
script_dir=$(dirname "$0")
examples="$script_dir/../examples/*.html"

# If length is too short, skip
key_length=${#api_key}

if [ $key_length -le 1 ] ; then
    echo "Skipping key step (examples might not work)"
    exit 0
fi

original_url="\"https://maps.googleapis.com/maps/api/js?v=3\""
modified_url="\"https://maps.googleapis.com/maps/api/js?v=3\&key=$api_key\""

# Replace key in examples
sed -i "s|$original_url|$modified_url|g" $examples
echo "Examples keys set"

exit 0
