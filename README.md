# cubingusa.org

## Prerequisites

You will need to install the following:
* [Google App Engine Python SDK](https://cloud.google.com/appengine/docs/flexible/python/download)
* [pip](https://pip.pypa.io/en/stable/)
* [sass](https://sass-lang.com/install)
* [virtualenv](https://virtualenv.pypa.io/en/latest/installation.html)

## Running app locally

If this is your first time running the CubingUSA website locally, follow the instructions in `doc/deploy.sh` to set up your local development server.

### Run the app

In another shell, run the Google Cloud local datastore:

```sh
gcloud beta emulators datastore start
```

Then run the server:

```sh
npm run all
```

You can use the `ADMIN_WCA_ID` environment variable to make yourself an admin:
```sh
ADMIN_WCA_ID=2005REYN01 npm run all
```

## Deploying to staging

Follow the instructions in `doc/staging.md` to upload your changes to the staging environment.
