from google.appengine.ext import ndb

from src import timezones
from src.handlers.scheduling.async.event_details import EventDetailsHandler
from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler
from src.models.scheduling.round import ScheduleRound
from src.models.scheduling.stage import ScheduleStage
from src.models.scheduling.time_block import ScheduleTimeBlock


class SetGroupCountsHandler(SchedulingBaseHandler):
  def post(self, schedule_version):
    if not self.SetSchedule(int(schedule_version)):
      return
    r = ScheduleRound.get_by_id(self.request.POST['round-id'])
    if not r:
      self.response.set_status(400)
      return
    r.num_groups = int(self.request.POST['num-groups'])
    r.num_staff_groups = int(self.request.POST['num-staff-groups'])
    r.put()

    self.response.write(EventDetailsHandler.GetImpl(self, self.schedule, r.event.get()))
