import cloudstorage as gcs
import webapp2

from src.handlers.base import BaseHandler

class ArchiveHandler(webapp2.RequestHandler):
  def get(self, path):
    if '/' not in path:
      path = path + '/'
    if path.endswith('/'):
      path = path + 'index.php'
    try:
      with gcs.open('/archive/' + path, 'r') as f:
        self.response.write(f.read())
    except:
      self.response.set_status(404)
