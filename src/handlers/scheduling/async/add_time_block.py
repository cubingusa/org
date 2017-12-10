from google.appengine.ext import ndb

from src import timezones
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.stage import ScheduleStage
from src.models.scheduling.time_block import ScheduleTimeBlock


class AddTimeBlockHandler(SchedulingBaseHandler):
  def post(self, schedule_version):
    if not self.SetSchedule(int(schedule_version)):
      return
    time_block_id = self.request.POST['id']
    old_time_block = ScheduleTimeBlock.get_by_id(time_block_id)
    is_new_time_block = not old_time_block

    if old_time_block and old_time_block.schedule != self.schedule.key:
      return
    time_block = old_time_block or ScheduleTimeBlock(id=time_block_id)

    time_block.schedule = self.schedule.key
    time_block.round = ndb.Key(ScheduleRound, self.request.POST['round'])
    time_block.stage = ndb.Key(ScheduleStage, self.request.POST['stage'])

    time_block.start_time = timezones.ToUTCTime(
        self.request.POST['day'] + ' ' + self.request.POST['start-time'],
        '%Y-%m-%d %I:%M %p', self.competition.timezone)
    time_block.end_time = timezones.ToUTCTime(
        self.request.POST['day'] + ' ' + self.request.POST['end-time'],
        '%Y-%m-%d %I:%M %p', self.competition.timezone)

    if 'staff-only' in self.request.POST:
      time_block.staff_only = bool(self.request.POST['staff-only'])
    time_block.put()

    self.redirect_to('event_details', schedule_version=schedule_version,
                     event_id=time_block.round.get().event.id(),
                     include_time_block=time_block_id)
