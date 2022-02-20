# cubingusa.org

## Prerequisites

You will need to install the following:
* [Google App Engine Python SDK](https://cloud.google.com/appengine/docs/flexible/python/download)
* [pip](https://pip.pypa.io/en/stable/)
* [sass](https://sass-lang.com/install)
* [virtualenv](https://virtualenv.pypa.io/en/latest/installation.html)

## Running app locally

If this is your first time running the CubingUSA website locally, follow the instructions in `doc/deploy.sh` to set up your local development server.

### sass

Run
```sh
./run_sass.sh
```
This command will keep running, and watch for updates to the scss files.

### Setup Cloud Datastore

We use Google Cloud Datastore, which you will need to run locally.  Run the command
```sh
gcloud beta emulators datastore start
```

### Run the app

Run the following commands in the same terminal:

Enable the virtualenv:
```sh
source env/bin/activate
```
Install python dependencies:
```sh
pip install -r requirements.txt
```
Configure the app to use the local datastore:
```sh
$(gcloud beta emulators datastore env-init)
```
Run the app:
```sh
gunicorn -b :8083 app:app
```

## Deploying to staging

Follow the instructions in `doc/staging.md` to upload your changes to the staging environment.
