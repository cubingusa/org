from google.cloud import ndb

from app.models.user import User
from app.models.wca.base import BaseModel
from app.models.wca.event import Event
from app.models.wca.person import Person

class RankBase(BaseModel):
  person = ndb.KeyProperty(kind=Person)
  event = ndb.KeyProperty(kind=Event)
  best = ndb.IntegerProperty()
  state = ndb.ComputedProperty(lambda self: self.GetState())
  is_state_record = ndb.BooleanProperty()

  def GetState(self):
    if not self.person or not self.person.get():
      return None
    return self.person.get().state

  @staticmethod
  def GetId(row):
    return '%s_%s' % (row['person_id'], row['event_id'])

  def ParseFromDict(self, row):
    self.person = ndb.Key(Person, row['person_id'])
    self.event = ndb.Key(Event, row['event_id'])
    self.best = int(row['best'])

  @staticmethod
  def ColumnsUsed():
    return ['person_id', 'event_id', 'best']

  def ObjectsToGet(self):
    return [self.person]


class RankAverage(RankBase):
  pass

class RankSingle(RankBase):
  pass
