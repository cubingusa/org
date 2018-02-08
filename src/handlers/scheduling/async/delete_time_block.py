from google.appengine.ext import ndb

from src.handlers.scheduling.async.event_details import EventDetailsHandler
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.models.scheduling.time_block import ScheduleTimeBlock


class DeleteTimeBlockHandler(SchedulingBaseHandler):
  def post(self, schedule_version, time_block_id):
    if not self.SetSchedule(int(schedule_version)):
      return
    time_block = ScheduleTimeBlock.get_by_id(time_block_id)
    time_block.key.delete()

    self.response.write(EventDetailsHandler.GetImpl(
                            self, self.schedule, time_block.round.get().event.get()))
