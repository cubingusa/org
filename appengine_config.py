import os
import google
from google.appengine.ext import vendor

lib_directory = os.path.dirname(__file__) + '/lib'

# Background: https://github.com/GoogleCloudPlatform/google-auth-library-python/issues/169
# By the time we reach this code, we've already imported google.  But since we
# are vendoring google.auth, and adding it to the path here, python would just
# look for google.auth in the directory where we initially imported google, and
# that doesn't have an auth subpackage.
#
# To work around that, we need to muck with google.__path__ to include the
# vendor directory we're adding.
google.__path__ = [os.path.join(lib_directory, 'google')] + google.__path__

# Add any libraries install in the "lib" folder.
vendor.add(lib_directory)
