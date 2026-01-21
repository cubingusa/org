from google.cloud import ndb

from app.models.wca.base import BaseModel
from app.models.wca.continent import Continent

class Country(BaseModel):
  name = ndb.StringProperty()
  continent = ndb.KeyProperty(kind=Continent)
  iso2 = ndb.StringProperty()

  def ParseFromDict(self, row):
    self.name = row['name']
    self.continent = ndb.Key(Continent, row['continent_id'])
    self.iso2 = row['iso2']

  @staticmethod
  def ColumnsUsed():
    return ['name', 'continent_id', 'iso2']
