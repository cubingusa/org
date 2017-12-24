# Staging Environment

## Prerequisite

Please ask webmaster@cubingusa.org to add you as an editor to the staging app: https://console.cloud.google.com/iam-admin/iam/project?project=staging-cubingusa-org&organizationId=423466519340

## Deploy your version

You can use `deploy.sh` to deploy to staging:

```sh
./deploy.sh -s -f *.yaml -v $YOUR_VERSION_NAME
```

Please select a unique version name which includes your name.  Be aware that all staging versions of the app share the same datastore, so please be careful to avoid breaking other people!

Once you finish this script, your app will be visible at `https://$YOUR_VERSION_NAME-dot-staging-cubingusa-org.appspot.com`.
