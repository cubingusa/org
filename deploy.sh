#!/usr/bin/env bash

# Usage:
# ./deploy.sh app.yaml -- to just deploy the main website.
# ./deploy.sh app.yaml admin.yaml -- to deploy the main website and admin handlers.
# ./deploy.sh cron.yaml -- to modify cron jobs.

# This may clash with dev_app.sh as both write css to the same directory.  This
# script compiles minified css, while the other does not.
# TODO: consider fixing this by using different CSS paths for dev and prod.

echo "Recompiling minified CSS."
sass src/scss:src/static/css --style compressed

echo "Deploying to App Engine."
gcloud app deploy "$@"
