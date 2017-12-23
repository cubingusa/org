# Importing the WCA Database

## Why?

We use the WCA Database export for a few things, including:

* State Rankings
* Identifying whether a competitor has a qualifying time for Nationals
* Computing national and regional champions

## Background (or: why is this system complicated?)

There are a few important limitations in App Engine:
* -URL Fetch API has a [32 MB response size limit](https://cloud.google.com/appengine/docs/standard/python/outbound-requests#quotas_and_limits)
* Each instance class has a [limited amount of RAM](https://cloud.google.com/appengine/docs/standard/#instance_classes), starting with 128 MB for the default class.

Given that the WCA database is 65 MB compressed, and over 200 MB uncompressed, this means we can't just download it and read it in memory.

## Separate App Engine instance

We use a separate app instance for app-level admin tasks, including the database import, which has a higher memory ceiling.  Because this instance is more expensive, we don't serve end user traffic on this instance, which allows App Engine to shut it down when it's not in use.  This instance is configured by `admin.yaml`, and serves at `https://admin.cubingusa.org`.

We make heavy use of the [deferred library](https://cloud.google.com/appengine/articles/deferred) as a makeshift task queue, dividing work into smaller chunks.

## Database download

The entire flow runs in a cron job.  The first step is to download the database tsv export from the [WCA website](https://www.worldcubeassociation.org/results/misc/export.html) (see `download_export_chunk` in `src/handlers/admin/get_wca_export.py`).  We download in 16 MB chunks, immediately writing the response to Google Cloud Storage.  The result is 5 partial zip files.

After the database is downloaded, we read the entire zip file and check whether it's a new export.  If it's the same as the previously-imported export, we stop.  Otherwise, we extract the files we care about (notably not Scrambles).  We then write each file to Google Cloud Storage, as `$TABLE_NAME.csv`.

## Sharding

Each WCA table corresponds to a datastore model stored in `src/models/wca`.  Each row in each table has a unique ID, which allows us to ensure that subsequent imports don't add duplicate copies of a single row.  For most tables, the unique ID is just the `id` field.

In order to reduce the amount of work per request, we divide each table into shards, based on the MD5 hash of the ID.  The number of shards varies by table, and is defined in `get_tables()` in `src/wca/export.py`.  The number ranges from 1 (for Continents) to 40 (for Results).  We write each shard to Google Cloud Storage as `$TABLE_NAME.$SHARD_NUMBER.tsv`.

Using sufficiently many shards helps prevent OOMs.  It also minimizes the amount of work done after a failure: we can just retry the previous shard, rather than starting again.

## Filtering, diffing, and inserting

In order to avoid inserting the entire table each time, we save the previously-imported table as `${TABLE_NAME}_old.${SHARD_NUMBER}.tsv`.  For each shard, we compare the contents between the new and old file, and only update entries that have changed since the last import.

* For new entries, we create a new object and write it to the datastore.
* For changed entries, we read the old object from the datastore and update it.
* For deleted entries, we delete the old object from the datastore.

We don't keep the whole WCA database.  For example, the Results table is large and does not need to be stored in its entirety.  In general we keep data relevant to US competitions, so many models have a `Filter()` function which defines whether we should keep a given entry.

Once we are finished with a given shard, we copy the file to `${TABLE_NAME}_old.${SHARD_NUMBER}.tsv` and continue to the next one in a separate request.

## Post-import mutations

There is some data we recompute after each import.  For example, we compute state rankings immediately after importing data.  This is done in a step called "post-import mutations".
