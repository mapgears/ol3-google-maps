#!/bin/bash

# Get examples directory
script_dir=$(dirname "$0")
examples="$script_dir/../examples/*.html"

original_url="\"https://maps.googleapis.com/maps/api/js?v=3\&key=.*\""
modified_url="\"https://maps.googleapis.com/maps/api/js?v=3\""

# Replace key in examples
sed -i "s|$original_url|$modified_url|g" $examples
echo "Examples keys restored"

exit 0
