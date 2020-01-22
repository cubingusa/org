# Deployment

## Staging Environment

(See further down for deploying to prod. Please always deploy to staging to review first!)

### Prerequisite

Please ask webmaster@cubingusa.org to add you as an editor to the staging app: https://console.cloud.google.com/iam-admin/iam/project?project=staging-cubingusa-org

Once you have permission, click the >_ icon at the top right to get a terminal.

### Prep

If sass is not in your path:

```sh
sudo gem install sass
```
Check out your git branch. (See below for mini tutorial.)

### Deploy your version

You can use `deploy.sh` to deploy to staging:

```sh
./deploy.sh -s -f "*.yaml" -v $YOUR_VERSION_NAME
```

Please select a unique version name which includes your name.  Be aware that all staging versions of the app share the same datastore, so please be careful to avoid breaking other people!

Once you finish this script, your app will be visible at `https://$YOUR_VERSION_NAME-dot-staging-cubingusa-org.appspot.com`.

### Cleanup

If you are no longer using your staging app, please clean it up by running

```sh
gcloud app versions delete $YOUR_VERSION_NAME --project staging-cubingusa-org
```

### Mini git tutorial

The easiest thing way is:

1. Prep your changes in a branch on the website.
2. Check out the branch (recursive is needed to get external dependencies):
```sh
git clone --recursive -b $YOUR_BRANCH_NAME https://github.com/cubingusa/cubingusa-org.git
```
3. Deploy.
4. If you need to make more changes on the website, then run:
```sh
git pull
```
5. Go to step 3.


## Prod Environment

### Prerequisite

Please ask webmaster@cubingusa.org to add you as an editor to the prod app: https://console.cloud.google.com/iam-admin/iam/project?project=cubingusa-org

Once you have permission, click the >_ icon at the top right to get a terminal.

### Prep

If sass is not in your path:

```sh
sudo gem install sass
```

### Check out and deploy your version

1. Review your pull request on staging, get it reviewed, then merge it.
2. Check out the master branch (recursive is needed to get external dependencies):
```sh
git clone --recursive -b master https://github.com/cubingusa/cubingusa-org.git
```
Alternatively, if you've already cloned the repository, check out the master branch:
```sh
git checkout master
git pull
```
3. Deploy it. You can use `deploy.sh` to deploy to prod:
```sh
./deploy.sh -p -f "*.yaml"
```


