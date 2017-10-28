from google.appengine.ext import ndb

from src.models.wca.continent import Continent
from src.models.wca.export import WcaExport

class Country(ndb.Model):
  name = ndb.StringProperty()
  continent = ndb.KeyProperty(kind=Continent)
  iso2 = ndb.StringProperty()

  export = ndb.KeyProperty(kind=WcaExport)

  @staticmethod
  def GetId(row):
    return row['id']

  def ParseFromDict(self, row):
    self.name = row['name']
    self.continent = ndb.Key(Continent, row['continentId'])
    self.iso2 = row['iso2']
