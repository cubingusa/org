from google.appengine.ext import ndb

class Event(ndb.Model):
  name = ndb.StringProperty()
  rank = ndb.IntegerProperty()

  @staticmethod
  def GetId(row):
    return row['id']

  def ParseFromDict(self, row):
    self.name = row['name']
    self.rank = int(row['rank'])
