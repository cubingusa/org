import collections
import json

from google.appengine.ext import ndb

from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.schedule import Schedule
from src.models.scheduling.time_block import ScheduleTimeBlock
from src.models.wca.rank import RankAverage
from src.models.wca.rank import RankSingle


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

  def GetRound(self):
    return self._time_blocks[0].round.get()

  def GetStages(self):
    return sorted([s.get() for s in self._stage_keys], key=lambda s: s.number)


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
    self._is_qualified = False

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

  def IsQualified(self):
    return self._is_qualified

  def SetQualifyingTime(self, time, is_average, is_qualified):
    self._qualifying_time = time
    self._qualifying_time_is_average = is_average
    self._is_qualified = is_qualified


class CompetitionDetails(object):
  def __init__(self, user, competition, schedule=None):
    self.user = user
    self.competition = competition
    if schedule:
      self.schedule = schedule
    else:
      self.schedule = Schedule.query(ndb.AND(Schedule.competition == competition.key,
                                             Schedule.is_live == True)).get()
    if not self.schedule:
      return

    self.events = {}
    self.event_keys = []
    self.stage_ids = set()
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
      self.stage_ids.add(t.stage.id())
    if user and user.wca_person:
      self.ranks_single = {
          r.event.id() : r for r in
          RankSingle.query(RankSingle.person == user.wca_person).iter()}
      self.ranks_average = {
          r.event.id() : r for r in
          RankAverage.query(RankAverage.person == user.wca_person).iter()}
    else:
      self.ranks_single = {}
      self.ranks_average = {}

  def SetQualifyingTime(self, event_id, time, is_average):
    ranks_dict = self.ranks_average if is_average else self.ranks_single
    is_qualified = event_id in ranks_dict and ranks_dict[event_id].best <= time
    self.events[event_id].SetQualifyingTime(time, is_average, is_qualified)

  def GetEvents(self):
    return sorted(self.events.values(), key=lambda e: e.GetEvent().rank)

  def GetWcaEvents(self):
    return [e.GetEvent() for e in self.GetEvents()]

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

  def TimeBlocksByDay(self):
    time_blocks_dict = collections.defaultdict(list)
    for e in self.events.itervalues():
      for r in e.GetRounds():
        for t in r.GetGroupedTimeBlocks():
          time_blocks_dict[t.GetStartTime().date()].append(t)
    for time_blocks in time_blocks_dict.itervalues():
      time_blocks.sort(key=lambda t: t.GetStartTime())
    # Sort by day.
    return sorted(time_blocks_dict.items(), key=lambda i: i[0])

  def HasMultipleStages(self):
    return len(self.stage_ids) > 1
