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

  regional_single_record = ndb.StringProperty()
  regional_average_record = ndb.StringProperty()

  def ParseFromDict(self, row):
    self.competition = ndb.Key(Competition, row['competition_id'])
    self.event = ndb.Key(Event, row['event_id'])
    self.round_type = ndb.Key(RoundType, row['round_type_id'])
    self.person = ndb.Key(Person, row['person_id'])
    self.fmt = ndb.Key(Format, row['format_id'])

    self.person_name = row['person_name']
    self.person_country = ndb.Key(Country, row['person_country_id'])

    self.pos = int(row['pos'])
    self.best = int(row['best'])
    self.average = int(row['average'])

    self.regional_single_record = row['regional_single_record']
    self.regional_average_record = row['regional_average_record']

  @staticmethod
  def Filter():
    # Only include results of championships that are in the datastore.
    known_competitions = set([championship.competition.id() for championship in Championship.query().iter()])

    def filter_row(row):
      return row['competition_id'] in known_competitions
    return filter_row

  @staticmethod
  def GetId(row):
    return '%s_%s_%s_%s' % (row['competition_id'], row['event_id'], row['round_type_id'], row['person_id'])

  @staticmethod
  def ColumnsUsed():
    return ['competition_id', 'event_id', 'round_type_id', 'person_id', 'format_id', 'person_name',
            'person_country_id', 'pos', 'best', 'average', 'regional_single_record', 'regional_average_record']
