import collections
import datetime
import webapp2

from google.appengine.ext import ndb

from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.models.scheduling.group import ScheduleGroup
from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.schedule import Schedule
from src.models.scheduling.time_block import ScheduleTimeBlock


# For these events, groups may overlap.  For other events, we just divide the
# time block into evenly(ish)-sized groups.
group_lengths_by_event = {
    '333mbf': datetime.timedelta(minutes=75),
    '555bf': datetime.timedelta(minutes=60),
}


def CreateGroups(schedule, time_blocks, r, count_by_stage, num_to_create):
  total_time = sum([t.end_time - t.start_time for t in time_blocks],
                   datetime.timedelta())
  average_length = total_time / num_to_create

  # Initially divide the groups amongst the time blocks evenly, rounding down
  # the number that can fit.
  num_per_time_block = {
      t.key : int((t.end_time - t.start_time).total_seconds() / average_length.total_seconds())
      for t in time_blocks}

  # If we have leftovers, sort by average time per group assuming we add one
  # more group to that time block, and add to the least busy.
  time_blocks_sorted = sorted(time_blocks,
                              key=lambda t: (t.end_time - t.start_time) /
                                            (num_per_time_block[t.key] + 1), reverse=True)
  time_blocks_for_extra = time_blocks_sorted[:num_to_create - sum(num_per_time_block.values())]
  for time_block in time_blocks_for_extra:
    num_per_time_block[time_block.key] += 1

  groups = []
  # Now create the groups.  We do this starting with the earliest to keep
  # numbers ascending.
  for t in sorted(time_blocks, key=lambda t: t.start_time):
    num = num_per_time_block[t.key]
    stage = t.stage
    if r.event.id() in group_lengths_by_event:
      group_length = group_lengths_by_event[r.event.id()]
      group_length_seconds = int(group_length.total_seconds())
    else:
      # Round up to the nearest 5 minutes.
      group_length_seconds = (int(((t.end_time - t.start_time) / num).total_seconds()) / 300) * 300
      group_length = datetime.timedelta(seconds=group_length_seconds)
    exact_group_length_seconds = int((t.end_time - t.start_time).total_seconds() / num)
    for i in range(num):
      rounded_offset = int((exact_group_length_seconds * i) / 300) * 300
      group = ScheduleGroup()
      group.time_block = t.key
      count_by_stage[stage] += 1
      group.number = count_by_stage[stage]
      group.start_time = t.start_time + datetime.timedelta(seconds=rounded_offset)
      group.end_time = group.start_time + group_length
      groups.append(group)
  return groups


class CreateGroupsHandler(SchedulingBaseHandler):
  def get(self, schedule_version):
    if not self.SetSchedule(int(schedule_version)):
      return

    existing_groups = ScheduleGroup.query(ScheduleGroup.schedule == self.schedule.key).fetch(keys_only=True)

    time_blocks_by_round = collections.defaultdict(list)
    rounds = {}

    for time_block in ScheduleTimeBlock.query(ScheduleTimeBlock.schedule == self.schedule.key).iter():
      time_blocks_by_round[time_block.round].append(time_block)

    for r in ScheduleRound.query(ScheduleRound.schedule == self.schedule.key).iter():
      rounds[r.key] = r

    groups_to_put = []

    for round_key in rounds:
      r = rounds[round_key]
      if not r.num_groups:
        continue
      time_blocks = time_blocks_by_round[round_key]
      time_blocks_by_staff_only = collections.defaultdict(list)
      for time_block in time_blocks:
        time_blocks_by_staff_only[time_block.staff_only].append(time_block)
      num_by_stage = collections.defaultdict(lambda: 0)
      round_groups = CreateGroups(self.schedule, time_blocks_by_staff_only[False],
                                  r, num_by_stage, r.num_groups - (r.num_staff_groups or 0))
      if time_blocks_by_staff_only[True]:
        round_groups.extend(CreateGroups(self.schedule, time_blocks_by_staff_only[True],
                                         r, num_by_stage, r.num_staff_groups))
      groups_to_put.extend(round_groups)

    ndb.delete_multi(existing_groups)
    ndb.put_multi(groups_to_put)

    self.schedule.last_update = datetime.datetime.now()
    self.schedule.put()
    self.redirect(webapp2.uri_for('edit_schedule',
                                  competition_id=self.competition.key.id(),
                                  schedule_version=self.schedule.key.id()))
