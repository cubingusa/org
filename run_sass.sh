#!/usr/bin/env bash

echo "Starting sass."
external/dart-sass/sass --watch src/scss:app/static/css
