# cubingusa.org

## Prerequisites

You will need to install the following:

- [Google App Engine Python SDK](https://cloud.google.com/appengine/docs/flexible/python/download)
- [pip](https://pip.pypa.io/en/stable/)
- [sass](https://sass-lang.com/install)
- [virtualenv](https://virtualenv.pypa.io/en/latest/installation.html)

## Submodules

This app uses git submodules for external dependencies. After cloning the repository, run

```sh
git submodule update --init --recursive
```

## Running app locally

If this is your first time running the CubingUSA website locally, follow the instructions in `doc/deploy.md` to set up your local development server.

### Google cloud

You will need to install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) and run

```sh
gcloud auth login
gcloud config set project staging-cubingusa-org
```

#### Setup Cloud Datastore

We use Google Cloud Datastore, which you will need to run locally. Run the command

```sh
gcloud beta emulators datastore start
```

Configure the app to use the local datastore:

```sh
$(gcloud beta emulators datastore env-init)
```

### sass

Run

```sh
./run_sass.sh
```

This command will keep running, and watch for updates to the scss files.

### virtualenv

Run the following commands in the same terminal:

Enable the virtualenv:

```sh
virtualenv -p python3 env
```

```sh
source env/bin/activate
```

Install python dependencies:

```sh
pip install -r requirements.txt
```

### Running the app

Start the local dev server:

```sh
gunicorn -b :8083 app.flask:app --reload
```

You can use the `ADMIN_WCA_ID` environment variable to make yourself an admin:

```sh
ADMIN_WCA_ID=2005REYN01 gunicorn -b :8083 app.flask:app --reload
```

## Deploying to staging

Follow the instructions in `doc/staging.md` to upload your changes to the staging environment.
