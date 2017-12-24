#!/usr/bin/env bash

# Arguments:
# -p: deploy to prod
# -s: deploy to staging
# -f <file or glob>: .yaml files to deploy
# -v <app version>: On staging, the name of the app version to upload.

set -e

PROJECT=""
IS_PROD=0
FILES_TO_DEPLOY=""
VERSION=""

while getopts "psf:v:" opt; do
  case $opt in
    p)
      PROJECT="cubingusa-org"
      IS_PROD=1
      ;;
    s)
      PROJECT="staging-cubingusa-org"
      IS_PROD=0
      ;;
    f)
      FILES_TO_DEPLOY="$FILES_TO_DEPLOY $OPTARG"
      ;;
    v)
      VERSION="$OPTARG"
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

if [ "$IS_PROD" == "1" -a ! -z "$VERSION" ]
then
  echo "You can't specify a version for the prod app." >&2
  exit 1
fi

if [ "$IS_PROD" == "0" -a -z "$VERSION" ]
then
  echo "You must specify a version with -v for the staging app." >&2
  exit 1
fi

echo "Updating python dependencies."
#pip2.7 install -t lib -r requirements.txt --upgrade

echo "Recompiling minified CSS."
#rm -r -f src/static/css/prod
#mkdir src/static/css/prod
#sass --update src/scss:src/static/css/prod --style compressed

echo "Deploying to App Engine."
CMD="gcloud app deploy $FILES_TO_DEPLOY --project $PROJECT"
if [ ! -z "$VERSION" ]
then
  CMD="$CMD --version $VERSION"
fi

echo "$CMD"
$CMD
