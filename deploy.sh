#!/usr/bin/env bash

# Arguments:
# -p: deploy to prod
# -s: deploy to staging
# -v <app version>: On staging, the name of the app version to upload.

set -e

PROJECT=""
IS_PROD=0
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
    v)
      VERSION="$OPTARG"
      if [ "$VERSION" == "admin" ]
      then
        echo "You can't use -v admin.  Please select another version name."
        exit 1
      fi
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

echo "Recompiling minified CSS."
rm -r -f app/static/css/prod
mkdir -p app/static/css/prod
external/dart-sass/sass --update app/scss:app/static/css/prod --style compressed

echo "Deploying to App Engine."
CMD="gcloud app deploy app.yaml --project $PROJECT"
if [ ! -z "$VERSION" ]
then
  CMD="$CMD --version $VERSION"
fi

echo "$CMD"
$CMD

if [ ! -z "$VERSION" ]
then
  URI="https://${VERSION}-dot-$PROJECT.appspot.com"
else
  URI="https://$PROJECT.appspot.com"
fi
echo "Successfully uploaded to $URI."

if [ ! -z "$VERSION" ]
then
  echo "Once you're done testing, please clean up by running:"
  echo "gcloud app versions delete $VERSION --project $PROJECT"
fi
