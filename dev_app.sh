#!/usr/bin/env bash

# Store local datastore and blobstore locally, to avoid tmp storage getting
# cleaned up on reboots.
mkdir -p .local_storage

echo "Starting dev_appserver.py."
dev_appserver.py app.yaml admin.yaml \
  --datastore_path=.local_storage/datastore \
  --blobstore_path=.local_storage/blobstore
