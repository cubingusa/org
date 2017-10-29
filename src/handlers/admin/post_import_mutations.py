from src.handlers.base import BaseHandler
from src.models.state import State
from src.post_import import mutations

class PostImportMutationsHandler(BaseHandler):
  def get(self):
    mutations.DoMutations()
