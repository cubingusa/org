#!/usr/bin/env bash

echo "Starting sass."
external/dart-sass/sass --watch app/scss:app/static/css
