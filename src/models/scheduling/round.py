from google.appengine.ext import ndb

from src.models.scheduling.schedule import Schedule
from src.models.wca.event import Event
from src.models.wca.format import Format

class ScheduleRound(ndb.Model):
  schedule = ndb.KeyProperty(kind=Schedule)
  event = ndb.KeyProperty(kind=Event)

  number = ndb.IntegerProperty()
  is_final = ndb.BooleanProperty()
  cutoff = ndb.IntegerProperty()
  time_limit = ndb.IntegerProperty()
  format = ndb.KeyProperty(kind=Format)
  wcif = ndb.StringProperty()

  group_length = ndb.IntegerProperty()
  num_competitors = ndb.IntegerProperty()
  num_groups = ndb.IntegerProperty()
  num_staff_groups = ndb.IntegerProperty()

  @staticmethod
  def Id(schedule_version, event_id, round_num):
    return '%d_%s_%d' % (schedule_version, event_id, round_num)
