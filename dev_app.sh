#!/usr/bin/env bash

set -e

# Store local datastore and blobstore locally, to avoid tmp storage getting
# cleaned up on reboots.
mkdir -p .local_storage

echo "Updating python dependencies."
pip2.7 install -t lib -r requirements.txt --upgrade

echo "Starting dev_appserver.py."
dev_appserver.py app.yaml admin.yaml \
  --datastore_path=.local_storage/datastore \
  --blobstore_path=.local_storage/blobstore
