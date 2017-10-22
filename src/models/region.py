from google.appengine.ext import ndb

class Region(ndb.Model):
  name = ndb.StringProperty()
