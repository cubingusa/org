from google.appengine.ext import ndb

class RoundType(ndb.Model):
  rank = ndb.IntegerProperty()
  name = ndb.StringProperty()
  final = ndb.BooleanProperty()
