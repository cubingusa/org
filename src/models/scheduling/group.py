from google.appengine.ext import ndb

from src import timezones
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

  # Only relevant for events like 333fm and 333mbf.
  attempt = ndb.ComputedProperty(lambda self: self.time_block.get().attempt)

  def GetStartTime(self):
    if not self.start_time:
      return None
    return timezones.ToLocalizedTime(self.start_time,
                                     self.schedule.get().competition.get().timezone)

  def GetEndTime(self):
    if not self.end_time:
      return None
    return timezones.ToLocalizedTime(self.end_time,
                                     self.schedule.get().competition.get().timezone)
