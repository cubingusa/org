import json

from google.appengine.ext import ndb

from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.schedule import Schedule
from src.models.scheduling.time_block import ScheduleTimeBlock


class GroupedTimeBlock(object):
  def __init__(self, t):
    self._time_blocks = [t]
    self._start_time = t.GetStartTime()
    self._end_time = t.GetEndTime()
    self._stage_keys = set([t.stage])

  def AddTimeBlock(self, t):
    self._time_blocks.append(t)
    self._end_time = max(self._end_time, t.GetEndTime())
    self._stage_keys.add(t.stage)

  def GetStartTime(self):
    return self._start_time

  def GetEndTime(self):
    return self._end_time

  def FormatTimes(self):
    return '%s %s - %s' % (
        self._start_time.strftime('%A'),
        self._start_time.strftime('%I:%M %p').lstrip('0'),
        self._end_time.strftime('%I:%M %p').lstrip('0'))


class RoundDetails(object):
  def __init__(self, r):
    self._r = r
    self._grouped_time_blocks = []

  def GetRound(self):
    return self._r

  def AddTimeBlock(self, t):
    if (self._grouped_time_blocks and
        t.GetStartTime() < self._grouped_time_blocks[-1].GetEndTime()):
      self._grouped_time_blocks[-1].AddTimeBlock(t)
    else:
      self._grouped_time_blocks.append(GroupedTimeBlock(t))

  def GetGroupedTimeBlocks(self):
    return self._grouped_time_blocks
    

class EventDetails(object):
  def __init__(self, event_key):
    self._event_key = event_key
    self._rounds = {}
    self._qualifying_time = None
    self._qualifying_time_is_average = False

  def AddRound(self, r):
    self._rounds[r.number] = RoundDetails(r)

  def AddTimeBlock(self, t):
    self._rounds[t.round.get().number].AddTimeBlock(t)

  def GetEvent(self):
    return self._event_key.get()

  def GetRounds(self):
    return self._rounds.values()

  def GetQualifyingTime(self):
    return self._qualifying_time

  def QualifyingTimeIsAverage(self):
    return self._qualifying_time_is_average

  def SetQualifyingTime(self, time, is_average):
    self._qualifying_time = time
    self._qualifying_time_is_average = is_average


class CompetitionDetails(object):
  def __init__(self, user, competition):
    self.user = user
    self.competition = competition
    self.schedule = Schedule.query(ndb.AND(Schedule.competition == competition.key,
                                           Schedule.is_live == True)).get()
    if not self.schedule:
      return

    self.events = {}
    self.event_keys = []
    for r in ScheduleRound.query(ScheduleRound.schedule == self.schedule.key).iter():
      if r.event.id() not in self.events:
        self.events[r.event.id()] = EventDetails(r.event)
        self.event_keys.append(r.event)
      self.events[r.event.id()].AddRound(r)

    for t in (ScheduleTimeBlock.query(ndb.AND(ScheduleTimeBlock.schedule == self.schedule.key,
                                              ScheduleTimeBlock.staff_only == False))
                               .order(ScheduleTimeBlock.start_time)
                               .iter()):
      self.events[t.round.get().event.id()].AddTimeBlock(t)

  def SetQualifyingTime(self, event_id, time, is_average):
    self.events[event_id].SetQualifyingTime(time, is_average)

  def GetEvents(self):
    return sorted(self.events.values(), key=lambda e: e.GetEvent().rank)

  def HasQualifyingTimes(self):
    for e in self.events.itervalues():
      if e.GetQualifyingTime():
        return True
    return False

  def HasMultipleRoundEvents(self):
    for e in self.events.itervalues():
      if len(e.GetRounds()) > 1:
        return True
    return False

  def HasCutoffs(self):
    for e in self.events.itervalues():
      for r in e.GetRounds():
        if r.GetRound().cutoff:
          return True
    return False
