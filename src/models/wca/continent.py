from google.appengine.ext import ndb

class Continent(ndb.Model):
  name = ndb.StringProperty()
