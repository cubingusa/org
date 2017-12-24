from google.appengine.ext import deferred

from src.post_import.update_champions import UpdateChampions

def DoMutations():
  deferred.defer(UpdateChampions)
