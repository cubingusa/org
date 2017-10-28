from google.appengine.ext import ndb

class RoundType(ndb.Model):
  rank = ndb.IntegerProperty()
  name = ndb.StringProperty()
  final = ndb.BooleanProperty()

  @staticmethod
  def GetId(row):
    return row['id']

  def ParseFromDict(self, row):
    self.rank = int(row['rank'])
    self.name = row['cellName']
    self.final = int(row['final']) == 1
