from google.appengine.ext import ndb

from src.models.scheduling.schedule import Schedule

class ScheduleStage(ndb.Model):
  schedule = ndb.KeyProperty(kind=Schedule)
  number = ndb.IntegerProperty()
  name = ndb.StringProperty()
  # The name for the css color.
  color = ndb.StringProperty()
  timers = ndb.IntegerProperty()
