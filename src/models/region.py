from google.appengine.ext import ndb

class Region(ndb.Model):
  name = ndb.StringProperty()
  championship_name = ndb.StringProperty()

  def CssClass(self):
    return 'region_%s' % self.key.id()
