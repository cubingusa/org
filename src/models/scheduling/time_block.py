from google.appengine.ext import ndb

from src import timezones
from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.schedule import Schedule
from src.models.scheduling.stage import ScheduleStage

# Represents a block of time on the schedule where a specific stage is doing
# a specific event.  There may be multiple groups in a single block.
class ScheduleTimeBlock(ndb.Model):
  schedule = ndb.KeyProperty(kind=Schedule)
  round = ndb.KeyProperty(kind=ScheduleRound)
  stage = ndb.KeyProperty(kind=ScheduleStage)
  start_time = ndb.DateTimeProperty()
  end_time = ndb.DateTimeProperty()
  staff_only = ndb.BooleanProperty()

  # Only relevant for events like 333fm and 333mbf.
  attempt = ndb.IntegerProperty()

  def GetStartTime(self):
    return timezones.ToLocalizedTime(self.start_time,
                                     self.schedule.get().competition.get().timezone)

  def GetEndTime(self):
    return timezones.ToLocalizedTime(self.end_time,
                                     self.schedule.get().competition.get().timezone)
