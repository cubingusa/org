from google.appengine.ext import ndb

from src.models.scheduling.schedule import Schedule

class ScheduleStage(ndb.Model):
  schedule = ndb.KeyProperty(kind=Schedule)
  number = ndb.IntegerProperty()
  name = ndb.StringProperty()
  color_hex = ndb.StringProperty()
  timers = ndb.IntegerProperty()
