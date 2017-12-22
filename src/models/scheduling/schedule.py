from google.appengine.ext import ndb

from src.models.scheduling.competition import ScheduleCompetition

class Schedule(ndb.Model):
  competition = ndb.KeyProperty(kind=ScheduleCompetition)
  creation_time = ndb.DateTimeProperty()
  last_update_time = ndb.DateTimeProperty()
  is_live = ndb.BooleanProperty()
  notes = ndb.StringProperty()

  start_date = ndb.DateProperty()
  end_date = ndb.DateProperty()
