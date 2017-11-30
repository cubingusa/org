import datetime

from src.handlers.scheduling.scheduling_base import SchedulingBaseHandler


class SetDatesHandler(SchedulingBaseHandler):
  def post(self, schedule_version, start_date, end_date):
    if not self.SetSchedule(int(schedule_version)):
      return
    self.schedule.start_date = datetime.datetime.strptime(start_date, '%Y-%m-%d').date()
    self.schedule.end_date = datetime.datetime.strptime(end_date, '%Y-%m-%d').date()
    self.schedule.last_update_time = datetime.datetime.now()
    self.schedule.put()
