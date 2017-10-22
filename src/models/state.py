from google.appengine.ext import ndb

from src.models.region import Region

class State(ndb.Model):
  name = ndb.StringProperty()
  region = ndb.KeyProperty(kind=Region)
  is_state = ndb.BooleanProperty()
