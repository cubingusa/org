from google.cloud import ndb

from app.models.championship import Championship
from app.models.wca.base import BaseModel
from app.models.wca.competition import Competition
from app.models.wca.country import Country
from app.models.wca.event import Event
from app.models.wca.format import Format
from app.models.wca.person import Person
from app.models.wca.round import RoundType

class Result(BaseModel):
  competition = ndb.KeyProperty(kind=Competition)
  event = ndb.KeyProperty(kind=Event)
  round_type = ndb.KeyProperty(kind=RoundType)
  person = ndb.KeyProperty(kind=Person)
  fmt = ndb.KeyProperty(kind=Format)

  person_name = ndb.StringProperty()
  person_country = ndb.KeyProperty(kind=Country)

  pos = ndb.IntegerProperty()
  best = ndb.IntegerProperty()
  average = ndb.IntegerProperty()
  values = ndb.IntegerProperty(repeated=True)

  regional_single_record = ndb.StringProperty()
  regional_average_record = ndb.StringProperty()

  def ParseFromDict(self, row):
    self.competition = ndb.Key(Competition, row['competitionId'])
    self.event = ndb.Key(Event, row['eventId'])
    self.round_type = ndb.Key(RoundType, row['roundTypeId'])
    self.person = ndb.Key(Person, row['personId'])
    self.fmt = ndb.Key(Format, row['formatId'])

    self.person_name = row['personName']
    self.person_country = ndb.Key(Country, row['personCountryId'])

    self.pos = int(row['pos'])
    self.best = int(row['best'])
    self.average = int(row['average'])
    self.values = [v for v in [int(row['value%d' % n]) for n in (1, 2, 3, 4, 5)] if v != 0]

    self.regional_single_record = row['regionalSingleRecord']
    self.regional_average_record = row['regionalAverageRecord']

  @staticmethod
  def Filter():
    # Only include results of championships that are in the datastore.
    known_competitions = set([championship.competition.id() for championship in Championship.query().iter()])

    def filter_row(row):
      return row['competitionId'] in known_competitions
    return filter_row

  @staticmethod
  def GetId(row):
    return '%s_%s_%s_%s' % (row['competitionId'], row['eventId'], row['roundTypeId'], row['personId'])

  @staticmethod
  def ColumnsUsed():
    return ['competitionId', 'eventId', 'roundTypeId', 'personId', 'formatId', 'personName',
            'personCountryId', 'pos', 'best', 'average', 'value1', 'value2', 'value3', 'value4',
            'value5', 'regionalSingleRecord', 'regionalAverageRecord']
