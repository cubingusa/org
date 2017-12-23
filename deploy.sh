#!/usr/bin/env bash

# Usage:
# ./deploy.sh app.yaml -- to just deploy the main website.
# ./deploy.sh app.yaml admin.yaml -- to deploy the main website and admin handlers.
# ./deploy.sh cron.yaml -- to modify cron jobs.

set -e

echo "Updating python dependencies."
pip2.7 install -t lib -r requirements.txt --upgrade

echo "Recompiling minified CSS."
rm -r -f src/static/css/prod
mkdir src/static/css/prod
sass --update src/scss:src/static/css/prod --style compressed

echo "Deploying to App Engine."
gcloud app deploy "$@"
