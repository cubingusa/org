from google.appengine.ext import ndb

from src.models.state import State
from src.models.wca.country import BaseModel
from src.models.wca.country import Country

class Person(BaseModel):
  # Details from row with subid 1 (i.e. most recent updates)
  name = ndb.StringProperty()
  country = ndb.KeyProperty(kind=Country)
  gender = ndb.StringProperty()

  # The person's state, if they're a US resident.  This isn't computed during
  # the database import.
  state = ndb.KeyProperty(kind=State)

  def ParseFromDict(self, row):
    self.name = row['name']
    self.country = ndb.Key(Country, row['countryId'])
    self.gender = row['gender']

  @staticmethod
  def Filter():
    return lambda row: row['subid'] == '1'

  @staticmethod
  def ColumnsUsed():
    return ['name', 'countryId', 'gender']

  def GetWCALink(self):
    return 'https://worldcubeassociation.org/persons/%s' % self.key.id()
