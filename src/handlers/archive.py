import cloudstorage as gcs
import urlparse
import webapp2

from google.appengine.api import app_identity

from src.handlers.base import BaseHandler

class ArchiveHandler(webapp2.RequestHandler):
  def get(self, path):
    url_parsed = urlparse.urlparse(self.request.url)
    # Redirect old cubingusa domain to archive.cubingusa.org.
    if 'cubingusa.com' in url_parsed.netloc:
      self.redirect('https://archive.cubingusa.org' + url_parsed.path)
      return

    if '.css' in path:
      self.response.headers['Content-Type'] = 'text/css'
    elif '.js' in path:
      self.response.headers['Content-Type'] = 'text/javascript'
    elif '.php' in path:
      self.response.headers['Content-Type'] = 'text/html'

    # This file is served at /alerts.css.  It's not really used, so ignore it.
    if path == 'alerts.css':
      return

    # Redirect contact.php to the cubingusa.org contact page.
    if path.endswith('contact.php'):
      self.redirect('https://cubingusa.org/about/contact')
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
