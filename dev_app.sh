#!/usr/bin/env bash

echo "Starting sass."
sass --watch scss:src/static/css & sass_pid=$!

echo "Starting dev_appserver.py."
dev_appserver.py app.yaml admin.yaml & dev_appserver_pid=$!

trap "kill -TERM $sass_pid $dev_appserver_pid" SIGINT

wait $sass_pid $dev_appserver_pid
