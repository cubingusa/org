from google.appengine.ext import ndb

from src.models.user import User
from src.models.wca.base import BaseModel
from src.models.wca.event import Event
from src.models.wca.person import Person

class RankBase(BaseModel):
  person = ndb.KeyProperty(kind=Person)
  event = ndb.KeyProperty(kind=Event)
  best = ndb.IntegerProperty()

  worldRank = ndb.IntegerProperty()
  continentRank = ndb.IntegerProperty()
  countryRank = ndb.IntegerProperty()

  @staticmethod
  def GetId(row):
    return '%s_%s' % (row['personId'], row['eventId'])

  def ParseFromDict(self, row):
    self.person = ndb.Key(Person, row['personId'])
    self.event = ndb.Key(Event, row['eventId'])
    self.best = int(row['best'])

    self.worldRank = int(row['worldRank'])
    self.continentRank = int(row['continentRank'])
    self.countryRank = int(row['countryRank'])

  @staticmethod
  def Filter():
    # Only include rankings for people with a state.
    person_ids = set([user.wca_person.id() for user in User.query() if user.state])

    def filter_row(row):
      return row['personId'] in person_ids
    return filter_row

  @staticmethod
  def ColumnsUsed():
    return ['personId', 'eventId', 'best', 'worldRank', 'continentRank', 'countryRank']


class RankAverage(RankBase):
  pass

class RankSingle(RankBase):
  pass
