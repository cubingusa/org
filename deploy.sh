#!/usr/bin/env bash

# Usage:
# ./deploy.sh -p -f app.yaml -- to just deploy the main website to prod.
# ./deploy.sh -s -f app.yaml -- to deploy to staging.
# ./deploy.sh -p -f *.yaml -- deploy the entire app to prod.

set -e

PROJECT=""
FILES_TO_DEPLOY=""

while getopts "psf:" opt; do
  case $opt in
    p)
      PROJECT="cubingusa-org"
      ;;
    s)
      PROJECT="staging-cubingusa-org"
      ;;
    f)
      FILES_TO_DEPLOY="$FILES_TO_DEPLOY $OPTARG"
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      exit 1
      ;;
  esac
done

if [ -z "$PROJECT" ]
then
  echo "Either -p (prod) or -s (staging) must be set." >&2
  exit 1
fi

if [ -z "$FILES_TO_DEPLOY" ]
then
  echo "At least one .yaml file must be specified with -f." >&2
  exit 1
fi

echo "Updating python dependencies."
pip2.7 install -t lib -r requirements.txt --upgrade

echo "Recompiling minified CSS."
rm -r -f src/static/css/prod
mkdir src/static/css/prod
sass --update src/scss:src/static/css/prod --style compressed

echo "Deploying to App Engine."
CMD="gcloud app deploy $FILES_TO_DEPLOY --project $PROJECT"
echo "$CMD"
$CMD
