#!/usr/bin/env bash

echo "Starting sass."
external/dart-sass/sass --watch src/scss:src/static/css
