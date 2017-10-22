from google.appengine.ext import ndb

class Event(ndb.Model):
  name = ndb.StringProperty()
  rank = ndb.IntegerProperty()
