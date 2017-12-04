from google.appengine.ext import ndb

from src.models.scheduling.schedule import Schedule
from src.models.scheduling.time_block import ScheduleTimeBlock

class ScheduleGroup(ndb.Model):
  schedule = ndb.ComputedProperty(lambda self: self.time_block.get().schedule)
  time_block = ndb.KeyProperty(kind=ScheduleTimeBlock)

  round = ndb.ComputedProperty(lambda self: self.time_block.get().round)
  stage = ndb.ComputedProperty(lambda self: self.time_block.get().stage)
  number = ndb.IntegerProperty()
  start_time = ndb.DateTimeProperty()
  end_time = ndb.DateTimeProperty()
  staff_only = ndb.ComputedProperty(lambda self: self.time_block.get().staff_only)
