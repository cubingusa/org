from google.cloud import ndb

from app.models.wca.base import BaseModel

class Continent(BaseModel):
  name = ndb.StringProperty()
  recordName = ndb.StringProperty()

  def ParseFromDict(self, row):
    self.name = row['name']
    self.recordName = row['record_name']

  @staticmethod
  def ColumnsUsed():
    return ['name', 'record_name']
