from google.cloud import ndb

from app.models.wca.base import BaseModel

class RoundType(BaseModel):
  rank = ndb.IntegerProperty()
  name = ndb.StringProperty()
  final = ndb.BooleanProperty()

  def ParseFromDict(self, row):
    self.rank = int(row['rank'])
    self.name = row['cell_name']
    self.final = int(row['final']) == 1

  @staticmethod
  def ColumnsUsed():
    return ['rank', 'cell_name', 'final']
