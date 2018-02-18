import cloudstorage as gcs
import webapp2

from google.appengine.api import app_identity

from src.handlers.base import BaseHandler

class ArchiveHandler(webapp2.RequestHandler):
  def get(self, path):
    if '.css' in path:
      self.response.headers['Content-Type'] = 'text/css'
    elif '.js' in path:
      self.response.headers['Content-Type'] = 'text/javascript'
    elif '.php' in path:
      self.response.headers['Content-Type'] = 'text/html'

    # This file is served at /alerts.css.  It's not really used, so ignore it.
    if path == 'alerts.css':
      return

    # Map /comp_id and /comp_id/ to /comp_id/index.php.
    if '/' not in path:
      path = path + '/'
    if path.endswith('/'):
      path = path + 'index.php'
    try:
      with gcs.open('/%s/archive/%s' % (app_identity.get_default_gcs_bucket_name(), path),
                    'r') as f:
        self.response.write(f.read())
    except:
      self.response.set_status(404)
