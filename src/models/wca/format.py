from google.appengine.ext import ndb

class Format(ndb.Model):
  name = ndb.StringProperty()

  @staticmethod
  def GetId(row):
    return row['id']

  def ParseFromDict(self, row):
    self.name = row['name']
