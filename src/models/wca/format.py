from google.appengine.ext import ndb

from src.models.wca.base import BaseModel

class Format(BaseModel):
  name = ndb.StringProperty()

  def ParseFromDict(self, row):
    self.name = row['name']
