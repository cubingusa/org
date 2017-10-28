from google.appengine.ext import ndb

from src.models.wca.event import Event
from src.models.wca.person import Person

class RankAverage(ndb.Model):
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


class RankSingle(ndb.Model):
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
