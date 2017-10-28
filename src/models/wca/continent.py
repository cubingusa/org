from google.appengine.ext import ndb

class Continent(ndb.Model):
  name = ndb.StringProperty()
  recordName = ndb.StringProperty()

  @staticmethod
  def GetId(row):
    return row['id']

  def ParseFromDict(self, row):
    self.name = row['name']
    self.recordName = row['recordName']
