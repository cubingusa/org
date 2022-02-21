# WCA Database Download

Downloading the WCA database uses enough memory that it's difficult to do from App Engine.  So we use a Compute Engine VM instead.

## Creating a new VM

You can create a new VM at https://console.cloud.google.com/compute/instancesAdd?project=staging-cubingusa-org.  Most of the settings can use the defaults.

* **Machine configuration**: We're currently using e2-medium.
* **Identity and API access**: Use the Compute Engine default service account
* **Management**: Use the following Startup script:

```sh
cd cubingusa
git pull
app/load_db/load_db.sh
echo CUBINGUSA_ENV=COMPUTE_ENGINE | sudo tee /etc/environment
```

Next, SSH into the instance and follow the instructions in `vm_setup.sh`.

Finally, switch to the Instance Schedule tab, and either create a new schedule or attach it to an existing one.  The schedule should both start and stop the instance.
