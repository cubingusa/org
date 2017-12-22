from google.appengine.ext import ndb

from src.models.wca.base import BaseModel

class Format(BaseModel):
  name = ndb.StringProperty()

  def ParseFromDict(self, row):
    self.name = row['name']

  @staticmethod
  def ColumnsUsed():
    return ['name']

  def GetShortName(self):
    # Average of 5 -> Ao5
    return self.name[0] + 'o' + self.name[-1]
