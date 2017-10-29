import webapp2

from src.post_import import mutations
from src.models.state import State

class PostImportMutationsHandler(webapp2.RequestHandler):
  def get(self):
    mutations.DoMutations()
