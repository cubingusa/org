from google.appengine.ext import ndb

class BaseModel(ndb.Model):
  @staticmethod
  def GetId(row):
    return row['id']

  def ParseFromDict(self, row):
    raise Exception('ParseFromDict is unimplemented.')

  @staticmethod
  def Filter():
    return lambda row: True
