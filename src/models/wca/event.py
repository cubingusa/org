from google.appengine.ext import ndb

from src.wca.models.base import BaseModel

class Event(BaseModel):
  name = ndb.StringProperty()
  rank = ndb.IntegerProperty()

  def ParseFromDict(self, row):
    self.name = row['name']
    self.rank = int(row['rank'])
